using System.Security.Claims;

using MediControlSV.Api.Data;

using MediControlSV.Api.Models;

using MediControlSV.Api.Infrastructure;

using Microsoft.EntityFrameworkCore;

namespace MediControlSV.Api.Endpoints;

public static class AdministrationEndpoints {

 public sealed record CreateUser(string Nombre,string Correo,string Password,string Rol,int? PacienteId=null);
 public sealed record AdminPasswordInput(string Nueva,string Confirmacion);

 public sealed record CreateDoctor(string Nombre,string Especialidad,string Jvpm,int UsuarioId,string? Telefono=null,string? Horario=null,List<ScheduleInput>? Horarios=null);

 public sealed record CreateService(string Nombre,decimal Precio);

 public static void MapAdministration(this RouteGroupBuilder api) {
  api.MapPut("/usuarios/{id:int}/password",async(int id,AdminPasswordInput v,AppDbContext db,ClaimsPrincipal user)=>{
   if(!Helpers.StrongPassword(v.Nueva))return Helpers.Bad("Use al menos 12 caracteres, mayúscula, minúscula, número y símbolo; máximo 72 bytes.");
   if(v.Nueva!=v.Confirmacion)return Helpers.Bad("Las contraseñas no coinciden.");
   var u=await db.Usuarios.FindAsync(id);if(u==null)return Results.NotFound();
   if(BCrypt.Net.BCrypt.Verify(v.Nueva,u.PasswordHash))return Helpers.Bad("La nueva contraseña debe ser diferente de la actual.");
   u.PasswordHash=BCrypt.Net.BCrypt.HashPassword(v.Nueva,12);u.IntentosFallidos=0;u.BloqueadoHastaUtc=null;
   foreach(var token in await db.TokensRecuperacion.Where(x=>x.UsuarioId==id&&x.UsadoUtc==null).ToListAsync())token.UsadoUtc=DateTime.UtcNow;
   db.Auditorias.Add(new Auditoria{UsuarioId=Helpers.UserId(user),Accion="RESTABLECER_CONTRASEÑA",Entidad="Usuario",EntidadId=id});
   await db.SaveChangesAsync();return Results.NoContent();
  }).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapGet("/usuarios",async(AppDbContext db)=>await db.Usuarios.AsNoTracking().OrderBy(x=>x.Nombre).Select(x=>new{x.Id,x.Nombre,x.Correo,x.Rol,x.Activo}).ToListAsync()).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPost("/usuarios",async(CreateUser v,AppDbContext db,ClaimsPrincipal user)=>{

   if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Length>160||!Helpers.Email(v.Correo)||!Helpers.StrongPassword(v.Password)||!new[]{"Administrador","Recepcionista","Medico","Paciente","Laboratorio"}.Contains(v.Rol))return Helpers.Bad("Nombre, correo, contraseña fuerte y rol válido son obligatorios.");

   var mail=v.Correo.Trim().ToLowerInvariant();if(await db.Usuarios.AnyAsync(x=>x.Correo==mail))return Results.Conflict(new{error="Correo ya registrado."});

   await using var tx=await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);Paciente? patient=null;if(v.PacienteId.HasValue){if(v.Rol!="Paciente")return Helpers.Bad("Solo una cuenta de paciente puede vincularse a un expediente.");patient=await db.Pacientes.FindAsync(v.PacienteId.Value);if(patient==null||patient.UsuarioId!=null)return Helpers.Bad("Expediente inexistente o ya vinculado.");}
   var u=new Usuario{Nombre=v.Nombre.Trim(),Correo=mail,PasswordHash=BCrypt.Net.BCrypt.HashPassword(v.Password,workFactor:12),Rol=v.Rol};db.Usuarios.Add(u);await db.SaveChangesAsync();if(patient!=null)patient.UsuarioId=u.Id;db.Auditorias.Add(new Auditoria{UsuarioId=Helpers.UserId(user),Accion="CREAR",Entidad="Usuario",EntidadId=u.Id});await db.SaveChangesAsync();await tx.CommitAsync();return Results.Created($"/api/usuarios/{u.Id}",new{u.Id});

  }).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPost("/medicos",async(CreateDoctor v,AppDbContext db,ClaimsPrincipal user)=>{

   if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Length>160||string.IsNullOrWhiteSpace(v.Jvpm)||v.Jvpm.Length>50||string.IsNullOrWhiteSpace(v.Especialidad)||v.Especialidad.Length>100)return Helpers.Bad("Datos del médico inválidos.");

   if((v.Telefono??"").Length>20||(v.Horario??"").Length>200)return Helpers.Bad("Teléfono u horario demasiado largos.");

   if(!await db.Usuarios.AnyAsync(x=>x.Id==v.UsuarioId&&x.Rol=="Medico"&&x.Activo))return Helpers.Bad("El médico necesita una cuenta activa de rol Medico.");

   if(await db.Medicos.AnyAsync(x=>x.Jvpm==v.Jvpm||x.UsuarioId==v.UsuarioId))return Results.Conflict(new{error="JVPM o cuenta ya vinculados."});

   var schedules=v.Horarios??AgendaRules.Defaults();if(!AgendaRules.Valid(schedules))return Helpers.Bad("Días y horas de atención inválidos.");await using var tx=await db.Database.BeginTransactionAsync();
   var m=new Medico{Nombre=v.Nombre.Trim(),Especialidad=v.Especialidad.Trim(),Jvpm=v.Jvpm.Trim(),UsuarioId=v.UsuarioId,Telefono=v.Telefono??"",Horario=v.Horario??""};db.Medicos.Add(m);await db.SaveChangesAsync();db.HorariosMedico.AddRange(schedules.Select(h=>new HorarioMedico{MedicoId=m.Id,DiaSemana=h.DiaSemana,Desde=h.Desde,Hasta=h.Hasta}));db.Auditorias.Add(new Auditoria{UsuarioId=Helpers.UserId(user),Entidad="Medico",EntidadId=m.Id,Accion="CREAR"});await db.SaveChangesAsync();await tx.CommitAsync();return Results.Created($"/api/medicos/{m.Id}",new{m.Id});

  }).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPost("/servicios",async(CreateService v,AppDbContext db,ClaimsPrincipal user)=>{

   if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Length>140||decimal.Round(v.Precio,2)!=v.Precio||v.Precio<0||v.Precio>100000)return Helpers.Bad("Servicio o precio inválidos.");var s=new Servicio{Nombre=v.Nombre.Trim(),Precio=v.Precio};db.Servicios.Add(s);await db.SaveChangesAsync();db.Auditorias.Add(new Auditoria{UsuarioId=Helpers.UserId(user),Accion="CREAR",Entidad="Servicio",EntidadId=s.Id});await db.SaveChangesAsync();return Results.Created($"/api/servicios/{s.Id}",new{s.Id});

  }).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPost("/pacientes/{id:int}/vincular/{usuarioId:int}",async(int id,int usuarioId,AppDbContext db)=>{

   var p=await db.Pacientes.FindAsync(id);if(p==null)return Results.NotFound();if(!await db.Usuarios.AnyAsync(x=>x.Id==usuarioId&&x.Rol=="Paciente"&&x.Activo))return Helpers.Bad("Cuenta de paciente inexistente.");if(await db.Pacientes.AnyAsync(x=>x.UsuarioId==usuarioId&&x.Id!=id))return Results.Conflict(new{error="La cuenta ya pertenece a otro paciente."});p.UsuarioId=usuarioId;await db.SaveChangesAsync();return Results.NoContent();

  }).RequireAuthorization(p=>p.RequireRole("Administrador"));

 }

}

