using System.Text;
using System.Security.Claims;
using MediControlSV.Api.Data;
using MediControlSV.Api.Endpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;
using MediControlSV.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException("Configure Jwt:Key con un secreto aleatorio de al menos 32 bytes, fuera del repositorio (user-secrets o variables de entorno).");
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opt => {
    opt.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer=true, ValidateAudience=true, ValidateIssuerSigningKey=true, ValidateLifetime=true,
        ValidIssuer=builder.Configuration["Jwt:Issuer"], ValidAudience=builder.Configuration["Jwt:Audience"],
        IssuerSigningKey=new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew=TimeSpan.FromSeconds(30)
    };
    opt.Events=new JwtBearerEvents { OnTokenValidated=async context=>{
        var db=context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var id=Helpers.UserId(context.Principal!);var role=Helpers.Role(context.Principal!);
        if(!await db.Usuarios.AnyAsync(x=>x.Id==id&&x.Activo&&x.Rol==role))context.Fail("Cuenta inactiva o permisos modificados.");
    }};
});
builder.Services.AddAuthorization(o => o.AddPolicy("Administracion", p => p.RequireRole("Administrador","Recepcionista")));
var frontendOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(origin => origin.TrimEnd('/'))
    .Concat(new[] { "http://localhost:5173", "http://127.0.0.1:5173" })
    .Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
builder.Services.AddCors(o => o.AddPolicy("Frontend", p => p.WithOrigins(frontendOrigins).AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddRateLimiter(options => {
    options.RejectionStatusCode=429;
    options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString()??"unknown", _=>new FixedWindowRateLimiterOptions{PermitLimit=10,Window=TimeSpan.FromMinutes(1),QueueLimit=0}));
});
var app=builder.Build();
app.Use(async(context,next)=>{
 try {await next();}
 catch(Exception ex) when(!context.Response.HasStarted) {
  var sql=(ex as Microsoft.EntityFrameworkCore.DbUpdateException)?.InnerException as Microsoft.Data.SqlClient.SqlException ?? ex as Microsoft.Data.SqlClient.SqlException;
  var status=ex is BadHttpRequestException?400:sql?.Number is 2601 or 2627 or 547?409:sql!=null?503:500;
  app.Logger.LogError(ex,"Fallo de solicitud {TraceId}",context.TraceIdentifier);
  context.Response.Clear();context.Response.StatusCode=status;
  await context.Response.WriteAsJsonAsync(new {error=status==400?"Solicitud inválida. Revise los campos enviados.":status==409?"Los datos entran en conflicto con registros existentes.":status==503?"Base de datos no disponible. Intente nuevamente.":"No se pudo completar la operación.",traceId=context.TraceIdentifier});
 }
});
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();app.UseAuthorization();
app.MapGet("/api/health", async (AppDbContext db) => await db.Database.CanConnectAsync() ? Results.Ok(new { estado="activo", baseDatos="conectada" }) : Results.Problem("Sin conexión a SQL Server", statusCode:503));
app.MapAuth();
var secured=app.MapGroup("/api").RequireAuthorization().AddEndpointFilter<InputValidationFilter>();
secured.MapPatients();
secured.MapAppointments();
secured.MapClinical();
secured.MapAdministration();
secured.MapClinicalRead();
secured.MapPortal();
secured.MapDocuments();
secured.MapGet("/medicos",async(AppDbContext db)=>await db.Medicos.AsNoTracking().Where(x=>x.Activo).Select(x=>new{x.Id,x.Nombre,x.Especialidad,x.Jvpm}).ToListAsync());
secured.MapGet("/servicios",async(AppDbContext db)=>await db.Servicios.AsNoTracking().Where(x=>x.Activo).Select(x=>new{x.Id,x.Nombre,x.Precio}).ToListAsync());
secured.MapGet("/reportes/resumen",async(AppDbContext db)=>Results.Ok(new{pacientes=await db.Pacientes.CountAsync(),citas=await db.Citas.CountAsync(),consultas=await db.Consultas.CountAsync(),pagos=await db.Pagos.Where(x=>x.Estado=="Pagado").SumAsync(x=>(decimal?)x.Monto)??0m})).RequireAuthorization("Administracion");
using(var scope=app.Services.CreateScope()) await DbInitializer.Initialize(scope.ServiceProvider.GetRequiredService<AppDbContext>(),app.Configuration,app.Environment);
app.Run();
