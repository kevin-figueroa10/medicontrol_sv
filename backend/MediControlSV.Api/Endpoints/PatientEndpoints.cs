using System.Security.Claims;
using MediControlSV.Api.Data;
using MediControlSV.Api.Infrastructure;
using MediControlSV.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace MediControlSV.Api.Endpoints;
public static class PatientEndpoints {
 public sealed record PatientInput(string Nombre,string Documento,DateOnly FechaNacimiento,string? Telefono,string? Correo);
 static string? Validate(PatientInput v){if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Trim().Length<3||v.Nombre.Trim().Length>160)return "Nombre obligatorio (máximo 160).";if(string.IsNullOrWhiteSpace(v.Documento)||v.Documento.Trim().Length<5||v.Documento.Trim().Length>30)return "Documento obligatorio (máximo 30).";if(v.FechaNacimiento> DateOnly.FromDateTime(DateTime.Today)||v.FechaNacimiento<new DateOnly(1900,1,1))return "Fecha de nacimiento fuera del rango permitido.";if(!string.IsNullOrWhiteSpace(v.Telefono)&&!System.Text.RegularExpressions.Regex.IsMatch(v.Telefono,@"^\+?[0-9 ()-]{8,20}$"))return "Teléfono demasiado largo.";if(!string.IsNullOrWhiteSpace(v.Correo)&&!Helpers.Email(v.Correo))return "Correo inválido.";return null;}
 public static void MapPatients(this RouteGroupBuilder api){
  var group=api.MapGroup("/pacientes");
  group.MapGet("/",async(AppDbContext db,string? q,int? page,int? size)=>{
   var p=Math.Clamp(page??1,1,100000);var s=Math.Clamp(size??20,1,100);
   var query=db.Pacientes.AsNoTracking().AsQueryable();if(!string.IsNullOrWhiteSpace(q)){var term=q.Trim();if(term.Length>100)return Results.BadRequest(new{error="Búsqueda demasiado larga."});query=query.Where(x=>x.Nombre.Contains(term)||x.Documento.Contains(term));}
   var count=await query.CountAsync();var list=await query.OrderBy(x=>x.Id).Skip((p-1)*s).Take(s).Select(x=>new{x.Id,x.Nombre,x.Documento,x.FechaNacimiento,x.Telefono,x.Correo,x.Activo}).ToListAsync();return Results.Ok(new{total=count,items=list,page=p,size=s});
  }).RequireAuthorization("Administracion");
  group.MapGet("/{id:int}",async(int id,AppDbContext db,ClaimsPrincipal user)=>{
   var p=await db.Pacientes.AsNoTracking().Where(x=>x.Id==id).Select(x=>new{x.Id,x.UsuarioId,x.Nombre,x.Documento,x.FechaNacimiento,x.Telefono,x.Correo,x.Activo}).FirstOrDefaultAsync();if(p==null)return Results.NotFound();
   if(Helpers.Role(user)=="Medico"&&!await db.Citas.AnyAsync(x=>x.PacienteId==id&&x.Medico!.UsuarioId==Helpers.UserId(user)))return Results.Forbid();
   if(Helpers.Role(user)=="Paciente" && p.UsuarioId!=Helpers.UserId(user))return Results.Forbid();return Results.Ok(p);
  });
  group.MapPost("/",async(PatientInput input,AppDbContext db,ClaimsPrincipal user)=>{
   var error=Validate(input);if(error!=null)return Helpers.Bad(error);var doc=input.Documento.Trim();if(await db.Pacientes.AnyAsync(x=>x.Documento==doc))return Results.Conflict(new{error="El documento ya está registrado."});
   var entity=new Paciente{Nombre=input.Nombre.Trim(),Documento=doc,FechaNacimiento=input.FechaNacimiento,Telefono=input.Telefono?.Trim()??"",Correo=input.Correo?.Trim().ToLowerInvariant()??""};db.Pacientes.Add(entity);await db.SaveChangesAsync();db.Auditorias.Add(new Auditoria{UsuarioId=Helpers.UserId(user),Accion="CREAR",Entidad="Paciente",EntidadId=entity.Id});await db.SaveChangesAsync();return Results.Created($"/api/pacientes/{entity.Id}",new{entity.Id});
  }).RequireAuthorization("Administracion");
  group.MapPut("/{id:int}",async(int id,PatientInput input,AppDbContext db,ClaimsPrincipal user)=>{
   var error=Validate(input);if(error!=null)return Helpers.Bad(error);var entity=await db.Pacientes.FindAsync(id);if(entity==null)return Results.NotFound();var doc=input.Documento.Trim();if(await db.Pacientes.AnyAsync(x=>x.Id!=id&&x.Documento==doc))return Results.Conflict(new{error="Documento duplicado."});
   entity.Nombre=input.Nombre.Trim();entity.Documento=doc;entity.FechaNacimiento=input.FechaNacimiento;entity.Telefono=input.Telefono?.Trim()??"";entity.Correo=input.Correo?.Trim().ToLowerInvariant()??"";db.Auditorias.Add(new Auditoria{UsuarioId=Helpers.UserId(user),Accion="ACTUALIZAR",Entidad="Paciente",EntidadId=id});await db.SaveChangesAsync();return Results.NoContent();
  }).RequireAuthorization("Administracion");
 }
}
