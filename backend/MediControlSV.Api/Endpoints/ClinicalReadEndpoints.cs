using System.Security.Claims;
using MediControlSV.Api.Data;
using MediControlSV.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
namespace MediControlSV.Api.Endpoints;
public static class ClinicalReadEndpoints {
 public static void MapClinicalRead(this RouteGroupBuilder api){
  api.MapGet("/consultas",async(AppDbContext db,ClaimsPrincipal user)=>{
   var uid=Helpers.UserId(user);var q=db.Consultas.AsNoTracking().AsQueryable();
   if(Helpers.Role(user)=="Medico")q=q.Where(x=>x.Cita!.Medico!.UsuarioId==uid);
   if(Helpers.Role(user)=="Paciente")q=q.Where(x=>x.Cita!.Paciente!.UsuarioId==uid);
   return await q.OrderByDescending(x=>x.FechaUtc).Take(100).Select(x=>new{x.Id,x.CitaId,x.Motivo,x.Diagnostico,x.Estado,x.FechaUtc}).ToListAsync();
  }).RequireAuthorization(p=>p.RequireRole("Administrador","Medico","Paciente"));
  api.MapGet("/recetas",async(AppDbContext db,ClaimsPrincipal user)=>{
   var uid=Helpers.UserId(user);var q=db.Recetas.AsNoTracking().AsQueryable();
   if(Helpers.Role(user)=="Medico")q=q.Where(x=>x.Medico!.UsuarioId==uid);
   if(Helpers.Role(user)=="Paciente")q=q.Where(x=>x.Consulta!.Cita!.Paciente!.UsuarioId==uid);
   return await q.OrderByDescending(x=>x.FechaUtc).Take(100).Select(x=>new{x.Id,x.ConsultaId,x.Indicaciones,x.Anulada,x.FechaUtc}).ToListAsync();
  }).RequireAuthorization(p=>p.RequireRole("Administrador","Medico","Paciente"));
  api.MapGet("/estudios",async(AppDbContext db,ClaimsPrincipal user)=>{
   var uid=Helpers.UserId(user);var q=db.EstudiosMedicos.AsNoTracking().AsQueryable();
   if(Helpers.Role(user)=="Medico")q=q.Where(x=>x.Consulta!.Cita!.Medico!.UsuarioId==uid);
   if(Helpers.Role(user)=="Paciente")q=q.Where(x=>x.Consulta!.Cita!.Paciente!.UsuarioId==uid);
   return await q.OrderByDescending(x=>x.Id).Take(100).Select(x=>new{x.Id,x.ConsultaId,x.Tipo,x.Indicaciones,x.Estado}).ToListAsync();
  }).RequireAuthorization(p=>p.RequireRole("Administrador","Medico","Paciente"));
  api.MapGet("/seguimientos",async(AppDbContext db,ClaimsPrincipal user)=>{
   var uid=Helpers.UserId(user);var q=db.Seguimientos.AsNoTracking().AsQueryable();
   if(Helpers.Role(user)=="Medico")q=q.Where(x=>x.Consulta!.Cita!.Medico!.UsuarioId==uid);
   if(Helpers.Role(user)=="Paciente")q=q.Where(x=>x.Consulta!.Cita!.Paciente!.UsuarioId==uid);
   return await q.OrderByDescending(x=>x.Fecha).Take(100).Select(x=>new{x.Id,x.ConsultaId,x.Fecha,x.Motivo,x.Indicaciones,x.Estado}).ToListAsync();
  }).RequireAuthorization(p=>p.RequireRole("Administrador","Medico","Paciente"));
 }
}
