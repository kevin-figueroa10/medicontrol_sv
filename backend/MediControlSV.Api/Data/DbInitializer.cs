using MediControlSV.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace MediControlSV.Api.Data;
public static class DbInitializer {
 public static async Task Initialize(AppDbContext db,IConfiguration config,IHostEnvironment env){
  if(!env.IsDevelopment() || !config.GetValue<bool>("Database:InitializeDevelopment"))return;
  await db.Database.EnsureCreatedAsync();
  await db.Database.ExecuteSqlRawAsync(await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory,"SchemaUpgrade.sql")));
  if(!await db.Roles.AnyAsync()) { db.Roles.AddRange(new[]{"Administrador","Recepcionista","Medico","Paciente"}.Select(x=>new Rol{Nombre=x})); await db.SaveChangesAsync(); }
  if(!await db.Servicios.AnyAsync()) {db.Servicios.AddRange(new Servicio{Nombre="Consulta general",Precio=25m},new Servicio{Nombre="Control médico",Precio=20m});await db.SaveChangesAsync();}
  var email=config["Seed:AdminEmail"]; var pass=config["Seed:AdminPassword"];
  if(!string.IsNullOrWhiteSpace(email)&&!string.IsNullOrWhiteSpace(pass)&& !await db.Usuarios.AnyAsync()){
   if(!MediControlSV.Api.Infrastructure.Helpers.StrongPassword(pass))throw new InvalidOperationException("Contraseña inicial: mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.");
   db.Usuarios.Add(new Usuario {Nombre="Administrador inicial",Correo=email.Trim().ToLowerInvariant(),PasswordHash=BCrypt.Net.BCrypt.HashPassword(pass),Rol="Administrador"});await db.SaveChangesAsync();
  }
 }
}
