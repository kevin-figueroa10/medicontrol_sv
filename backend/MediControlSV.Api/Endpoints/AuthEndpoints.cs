using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediControlSV.Api.Data;
using MediControlSV.Api.Infrastructure;
using MediControlSV.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
namespace MediControlSV.Api.Endpoints;
public static class AuthEndpoints {
 public sealed record LoginInput(string Correo,string Password);
 public static void MapAuth(this WebApplication app){
  app.MapPost("/api/auth/login",async(LoginInput input,AppDbContext db,IConfiguration cfg)=>{
   if(string.IsNullOrWhiteSpace(input.Correo)||string.IsNullOrEmpty(input.Password)||input.Correo.Length>200||System.Text.Encoding.UTF8.GetByteCount(input.Password)>72)return Results.Unauthorized();
   var email=input.Correo.Trim().ToLowerInvariant();
   var u=await db.Usuarios.SingleOrDefaultAsync(x=>x.Correo==email);
   if(u==null||!u.Activo||u.BloqueadoHastaUtc>DateTime.UtcNow)return Results.Unauthorized();
   if(!BCrypt.Net.BCrypt.Verify(input.Password,u.PasswordHash)){
    u.IntentosFallidos++;
    if(u.IntentosFallidos>=5){u.BloqueadoHastaUtc=DateTime.UtcNow.AddMinutes(15);u.IntentosFallidos=0;}
    await db.SaveChangesAsync();return Results.Unauthorized();
   }
   u.IntentosFallidos=0;u.BloqueadoHastaUtc=null;await db.SaveChangesAsync();
   var key=cfg["Jwt:Key"]!;
   var claims=new[]{new Claim(ClaimTypes.NameIdentifier,u.Id.ToString()),new Claim(ClaimTypes.Name,u.Nombre),new Claim(ClaimTypes.Role,u.Rol),new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString())};
   var jwt=new JwtSecurityToken(issuer:cfg["Jwt:Issuer"],audience:cfg["Jwt:Audience"],claims:claims,expires:DateTime.UtcNow.AddMinutes(30),signingCredentials:new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),SecurityAlgorithms.HmacSha256));
   return Results.Ok(new{token=new JwtSecurityTokenHandler().WriteToken(jwt),rol=u.Rol,nombre=u.Nombre,expiraUtc=jwt.ValidTo});
  }).RequireRateLimiting("login");
  app.MapGet("/api/auth/me",async(ClaimsPrincipal user,AppDbContext db)=>{
    var id=Helpers.UserId(user);var u=await db.Usuarios.AsNoTracking().Where(x=>x.Id==id && x.Activo).Select(x=>new{x.Id,x.Nombre,x.Correo,x.Rol}).FirstOrDefaultAsync();return u==null?Results.Unauthorized():Results.Ok(u);
  }).RequireAuthorization();
 }
}
