using System.Data;

using System.Security.Claims;

using MediControlSV.Api.Data;

using MediControlSV.Api.Infrastructure;

using MediControlSV.Api.Models;

using Microsoft.EntityFrameworkCore;

namespace MediControlSV.Api.Endpoints;

public static class AppointmentEndpoints {

 public sealed record AppointmentInput(int PacienteId,int MedicoId,int ServicioId,DateTime Inicio,DateTime Fin,string? Motivo);

 public static void MapAppointments(this RouteGroupBuilder api){

  var g=api.MapGroup("/citas");

  g.MapGet("/",async(AppDbContext db,ClaimsPrincipal user,DateTime? desde,DateTime? hasta)=>{

   var role=Helpers.Role(user);var uid=Helpers.UserId(user);var q=db.Citas.AsNoTracking().AsQueryable();

   if(role=="Paciente")q=q.Where(x=>x.Paciente!.UsuarioId==uid);else if(role=="Medico")q=q.Where(x=>x.Medico!.UsuarioId==uid);

   if(desde.HasValue)q=q.Where(x=>x.Inicio>=desde.Value);if(hasta.HasValue)q=q.Where(x=>x.Inicio<hasta.Value);

   return Results.Ok(await q.OrderByDescending(x=>x.Inicio).Take(200).Select(x=>new{x.Id,x.PacienteId,Paciente=x.Paciente!.Nombre,x.MedicoId,Medico=x.Medico!.Nombre,x.ServicioId,Servicio=x.Servicio!.Nombre,x.Inicio,x.Fin,x.Estado,x.Motivo}).ToListAsync());

  });

  g.MapPost("/",async(AppointmentInput v,AppDbContext db,ClaimsPrincipal user)=>{

   v=v with { Inicio=Helpers.Utc(v.Inicio), Fin=Helpers.Utc(v.Fin) };

   if(v.PacienteId<=0||v.MedicoId<=0||v.ServicioId<=0||v.Fin<=v.Inicio||v.Fin-v.Inicio>TimeSpan.FromHours(4)||v.Inicio<DateTime.UtcNow||v.Inicio>DateTime.UtcNow.AddYears(2)|| (v.Motivo??"").Length>500)return Helpers.Bad("Datos o rango de cita inválidos.");

   var config=await db.ConfiguracionesConsultorio.AsNoTracking().FirstOrDefaultAsync();if(v.Inicio>DateTime.UtcNow.AddDays(config?.AnticipoDias??60))return Helpers.Bad("La fecha supera el anticipo permitido.");if(Helpers.Role(user)=="Paciente"&&config?.PermitirOnline==false)return Helpers.Bad("Las reservas en línea están deshabilitadas.");

   var uid=Helpers.UserId(user);if(Helpers.Role(user)=="Paciente"&&!await db.Pacientes.AnyAsync(x=>x.Id==v.PacienteId&&x.UsuarioId==uid))return Results.Forbid();

   if(!await db.Pacientes.AnyAsync(x=>x.Id==v.PacienteId&&x.Activo)||!await db.Medicos.AnyAsync(x=>x.Id==v.MedicoId&&x.Activo&&x.Usuario!=null&&x.Usuario.Activo)||!await db.Servicios.AnyAsync(x=>x.Id==v.ServicioId&&x.Activo))return Helpers.Bad("Paciente, médico o servicio inexistente/inactivo.");

   await using var tx=await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

   if(!await AgendaRules.Allowed(db,v.MedicoId,v.Inicio,v.Fin))return Helpers.Bad("La cita queda fuera del horario del médico.");
   if(await db.Citas.AnyAsync(x=>x.MedicoId==v.MedicoId&&x.Estado!="Cancelada"&&x.Inicio<v.Fin&&v.Inicio<x.Fin))return Results.Conflict(new{error="El médico ya tiene una cita en ese horario."});

   if(await db.Citas.AnyAsync(x=>x.PacienteId==v.PacienteId&&x.Estado!="Cancelada"&&x.Estado!="No asistió"&&x.Inicio<v.Fin&&v.Inicio<x.Fin))return Results.Conflict(new{error="El paciente ya tiene una cita en ese horario."});

   if(await db.BloqueosAgenda.AnyAsync(x=>x.MedicoId==v.MedicoId&&x.Inicio<v.Fin&&v.Inicio<x.Fin))return Results.Conflict(new{error="Horario bloqueado."});

   var agreedPrice=await db.Servicios.Where(s=>s.Id==v.ServicioId).Select(s=>s.Precio).SingleAsync();var c=new Cita{PrecioAcordado=agreedPrice,PacienteId=v.PacienteId,MedicoId=v.MedicoId,ServicioId=v.ServicioId,Inicio=v.Inicio,Fin=v.Fin,Motivo=v.Motivo?.Trim()??""};db.Citas.Add(c);await db.SaveChangesAsync();var recipients=await db.Medicos.Where(x=>x.Id==c.MedicoId&&x.UsuarioId!=null).Select(x=>x.UsuarioId!.Value).Concat(db.Pacientes.Where(x=>x.Id==c.PacienteId&&x.UsuarioId!=null).Select(x=>x.UsuarioId!.Value)).ToListAsync();foreach(var recipient in recipients.Distinct())db.Notificaciones.Add(new Notificacion{UsuarioId=recipient,CitaId=c.Id,Titulo="Cita confirmada",Mensaje=$"Cita #{c.Id} registrada para {TimeZoneInfo.ConvertTimeFromUtc(c.Inicio,TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time")):dd/MM/yyyy HH:mm}."});db.HistorialCitas.Add(new HistorialCita{CitaId=c.Id,UsuarioId=uid,EstadoNuevo="Confirmada"});db.Auditorias.Add(new Auditoria{UsuarioId=uid,Entidad="Cita",EntidadId=c.Id,Accion="CREAR"});await db.SaveChangesAsync();await tx.CommitAsync();return Results.Created($"/api/citas/{c.Id}",new{c.Id});

  }).RequireAuthorization(p=>p.RequireRole("Administrador","Recepcionista","Paciente"));

  g.MapPut("/{id:int}/horario",async(int id,MediControlSV.Api.Contracts.ReprogramarRequest v,AppDbContext db,ClaimsPrincipal user)=>{

   var start=Helpers.Utc(v.Inicio);var end=Helpers.Utc(v.Fin);if(start<DateTime.UtcNow||end<=start||end-start>TimeSpan.FromHours(4)||string.IsNullOrWhiteSpace(v.Motivo)||v.Motivo.Length>200)return Helpers.Bad("Horario o motivo inválidos.");

   await using var tx=await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);var c=await db.Citas.Include(x=>x.Paciente).FirstOrDefaultAsync(x=>x.Id==id);if(c==null)return Results.NotFound();
   if(!Helpers.CanReschedule(c.Estado,c.Inicio,Helpers.Role(user),DateTime.UtcNow))return Helpers.Bad("Solo se reprograman citas confirmadas o, desde recepción, citas sin atender de días anteriores y ausencias.");
   if(await db.Consultas.AnyAsync(x=>x.CitaId==id))return Helpers.Bad("La cita ya tiene una consulta registrada y no puede reprogramarse.");
   var config=await db.ConfiguracionesConsultorio.AsNoTracking().FirstOrDefaultAsync();if(start>DateTime.UtcNow.AddDays(config?.AnticipoDias??60))return Helpers.Bad("Anticipo fuera del límite.");if(Helpers.Role(user)=="Paciente"&&(c.Paciente!.UsuarioId!=Helpers.UserId(user)||c.Inicio<DateTime.UtcNow.AddHours(config?.CancelacionHoras??24)))return Results.Forbid();

   if(!await AgendaRules.Allowed(db,c.MedicoId,start,end))return Helpers.Bad("Horario fuera de la jornada del médico.");
   if(await db.Citas.AnyAsync(x=>x.Id!=id&&x.Estado!="Cancelada"&&x.Estado!="No asistió"&&(x.MedicoId==c.MedicoId||x.PacienteId==c.PacienteId)&&x.Inicio<end&&x.Fin>start)||await db.BloqueosAgenda.AnyAsync(x=>x.MedicoId==c.MedicoId&&x.Inicio<end&&x.Fin>start))return Results.Conflict(new{error="El horario ya está ocupado o bloqueado."});

   var previous=c.Estado;var previousStart=c.Inicio;var previousEnd=c.Fin;c.Inicio=start;c.Fin=end;c.Estado="Confirmada";
   db.HistorialCitas.Add(new HistorialCita{CitaId=id,UsuarioId=Helpers.UserId(user),EstadoAnterior=previous,EstadoNuevo="Confirmada",Motivo=v.Motivo});
   db.Auditorias.Add(new Auditoria{UsuarioId=Helpers.UserId(user),Accion="REPROGRAMAR",Entidad="Cita",EntidadId=id,Descripcion=$"{previousStart:O} / {previousEnd:O} → {start:O} / {end:O}"});
   await db.SaveChangesAsync();await tx.CommitAsync();return Results.NoContent();

  }).RequireAuthorization(p=>p.RequireRole("Administrador","Recepcionista","Paciente"));

  g.MapPatch("/{id:int}/estado",async(int id,string estado,AppDbContext db,ClaimsPrincipal user)=>{

   await using var tx=await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);var c=await db.Citas.FindAsync(id);if(c==null)return Results.NotFound();var role=Helpers.Role(user);if(role=="Paciente"&&(!await db.Pacientes.AnyAsync(x=>x.Id==c.PacienteId&&x.UsuarioId==Helpers.UserId(user))||estado!="Cancelada"))return Results.Forbid();if(role=="Medico"&&(!await db.Medicos.AnyAsync(x=>x.Id==c.MedicoId&&x.UsuarioId==Helpers.UserId(user))||estado is not ("En consulta" or "Finalizada")))return Results.Forbid();

   if(role=="Paciente"){var config=await db.ConfiguracionesConsultorio.AsNoTracking().FirstOrDefaultAsync();if(c.Inicio<DateTime.UtcNow.AddHours(config?.CancelacionHoras??24))return Helpers.Bad("El plazo para cancelar en línea terminó. Contacte a recepción.");}

   if(estado=="No asistió"&&c.Inicio>DateTime.UtcNow)return Helpers.Bad("La cita todavía no ha comenzado.");

   string[] allowed=["Confirmada","En espera","En consulta","Finalizada","Cancelada","No asistió"];if(!allowed.Contains(estado))return Helpers.Bad("Estado inválido.");if(c.Estado is "Finalizada" or "Cancelada")return Results.Conflict(new{error="La cita ya está cerrada."});if(!Helpers.CanTransition(c.Estado,estado,role))return Results.Conflict(new{error="Transición de estado no permitida para esta cita y rol."});if(estado=="Finalizada"){var consulta=await db.Consultas.FirstOrDefaultAsync(x=>x.CitaId==id);if(consulta==null)return Results.Conflict(new{error="Registre la consulta antes de finalizar la cita."});consulta.Estado="Finalizada";}var old=c.Estado;c.Estado=estado;db.HistorialCitas.Add(new HistorialCita{CitaId=id,UsuarioId=Helpers.UserId(user),EstadoAnterior=old,EstadoNuevo=estado});db.Auditorias.Add(new Auditoria{UsuarioId=Helpers.UserId(user),Entidad="Cita",EntidadId=id,Accion="ESTADO",Descripcion=old+" → "+estado});await db.SaveChangesAsync();await tx.CommitAsync();return Results.NoContent();

  });

 }

}

