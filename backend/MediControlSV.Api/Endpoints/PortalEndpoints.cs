using System.Security.Claims;

using System.Data;

using MediControlSV.Api.Data;

using MediControlSV.Api.Models;

using MediControlSV.Api.Infrastructure;

using Microsoft.EntityFrameworkCore;

namespace MediControlSV.Api.Endpoints;

public static class PortalEndpoints {

 public sealed record ActiveInput(bool Activo);

 public sealed record UserEdit(string Nombre,string Correo,string Rol);

 public sealed record PasswordInput(string Actual,string Nueva);

 public sealed record ClinicInput(string Nombre,string Direccion,string Telefono,string? Correo,string? Horario,int DuracionMinutos=30,int AnticipoDias=60,int CancelacionHoras=24,bool PermitirOnline=true);

 public sealed record SpecialtyInput(string Nombre,string? Descripcion);

 public sealed record ServiceDetails(string Nombre,string? Descripcion,decimal Precio,int DuracionMinutos);

 public sealed record DoctorEdit(string Nombre,string Especialidad,string Jvpm,int UsuarioId,string? Telefono,string? Horario,List<ScheduleInput>? Horarios=null);

 public sealed record PatientDetails(string Nombre,string Documento,DateOnly FechaNacimiento,string? Telefono,string? Correo,string? Sexo,string? Direccion,string? Notas,string? ContactoNombre,string? ContactoTelefono,string? Parentesco);

 public sealed record StudyResultInput(string Descripcion);

 public sealed record FollowStatus(string Estado,int? CitaId);

 public static void Audit(AppDbContext db,ClaimsPrincipal user,string action,string entity,int id)=>db.Auditorias.Add(new Auditoria{UsuarioId=Helpers.UserId(user),Accion=action,Entidad=entity,EntidadId=id});

 public static void MapPortal(this RouteGroupBuilder api) {

  api.MapGet("/panel",async(AppDbContext db,ClaimsPrincipal user)=>{

   var uid=Helpers.UserId(user);var role=Helpers.Role(user);var admin=role=="Administrador";var staff=admin||role=="Recepcionista";var clinical=admin||role=="Medico"||role=="Paciente";

   var pq=db.Pacientes.AsNoTracking().AsQueryable();var aq=db.Citas.AsNoTracking().AsQueryable();var cq=db.Consultas.AsNoTracking().AsQueryable();

   if(role=="Paciente"){pq=pq.Where(x=>x.UsuarioId==uid);aq=aq.Where(x=>x.Paciente!.UsuarioId==uid);cq=cq.Where(x=>x.Cita!.Paciente!.UsuarioId==uid);}

   else if(role=="Medico"){pq=pq.Where(x=>db.Citas.Any(a=>a.PacienteId==x.Id&&a.Medico!.UsuarioId==uid));aq=aq.Where(x=>x.Medico!.UsuarioId==uid);cq=cq.Where(x=>x.Cita!.Medico!.UsuarioId==uid);}

   if(!clinical)cq=cq.Where(x=>false);

   var consultationIds=cq.Select(x=>x.Id);

   var patients=await pq.OrderBy(x=>x.Nombre).Select(x=>new{x.Id,x.UsuarioId,x.Nombre,x.Documento,x.FechaNacimiento,x.Telefono,x.Correo,x.Activo,x.Sexo,x.Direccion,Notas=clinical?x.Notas:"",Contacto=db.ContactosEmergencia.Where(c=>c.PacienteId==x.Id).Select(c=>new{c.Nombre,c.Telefono,c.Parentesco}).FirstOrDefault(),UltimaConsulta=db.Consultas.Where(c=>c.Cita!.PacienteId==x.Id&&(staff||c.Cita.Medico!.UsuarioId==uid)).Max(c=>(DateTime?)c.FechaUtc)}).ToListAsync();

   var appointments=await aq.OrderBy(x=>x.Inicio).Select(x=>new{x.Id,x.PacienteId,Paciente=x.Paciente!.Nombre,x.MedicoId,Medico=x.Medico!.Nombre,Especialidad=x.Medico.Especialidad,x.ServicioId,Servicio=x.Servicio!.Nombre,Precio=x.PrecioAcordado,x.Inicio,x.Fin,x.Motivo,x.Estado,Pagado=db.Pagos.Where(p=>p.CitaId==x.Id&&p.Estado=="Pagado").Sum(p=>(decimal?)p.Monto)??0m,Llegada=db.HistorialCitas.Where(h=>h.CitaId==x.Id&&h.EstadoNuevo=="En espera"&&!db.HistorialCitas.Any(r=>r.CitaId==x.Id&&r.EstadoNuevo=="Confirmada"&&r.Id>h.Id)).Min(h=>(DateTime?)h.FechaUtc)}).ToListAsync();

   var doctors=await db.Medicos.AsNoTracking().Where(x=>admin||x.Activo).OrderBy(x=>x.Nombre).Select(x=>new{x.Id,x.UsuarioId,x.Nombre,x.Especialidad,x.Jvpm,x.Telefono,x.Horario,x.Activo,Horarios=db.HorariosMedico.Where(h=>h.MedicoId==x.Id&&h.Activo).Select(h=>new{h.DiaSemana,h.Desde,h.Hasta}).ToList(),Correo=staff?x.Usuario!.Correo:""}).ToListAsync();

   var services=await db.Servicios.AsNoTracking().Where(x=>admin||x.Activo).ToListAsync();

   var specialties=await db.Especialidades.AsNoTracking().OrderBy(x=>x.Nombre).ToListAsync();

   var consultations=await cq.OrderByDescending(x=>x.FechaUtc).Select(x=>new{x.Id,x.CitaId,PacienteId=x.Cita!.PacienteId,Paciente=x.Cita.Paciente!.Nombre,Medico=x.Cita.Medico!.Nombre,x.Motivo,x.Antecedentes,x.Evaluacion,x.Diagnostico,x.Tratamiento,x.Recomendaciones,x.Observaciones,x.Estado,x.FechaUtc,Signos=db.SignosVitales.Where(s=>s.ConsultaId==x.Id).FirstOrDefault()}).ToListAsync();

   var prescriptions=await db.Recetas.AsNoTracking().Where(x=>consultationIds.Contains(x.ConsultaId)).OrderByDescending(x=>x.FechaUtc).Select(x=>new{x.Id,x.ConsultaId,PacienteId=x.Consulta!.Cita!.PacienteId,Paciente=x.Consulta.Cita.Paciente!.Nombre,Medico=x.Medico!.Nombre,Especialidad=x.Medico.Especialidad,x.Medico.Jvpm,Diagnostico=x.Consulta.Diagnostico,x.Indicaciones,x.Anulada,x.FechaUtc,Medicamentos=db.DetallesReceta.Where(d=>d.RecetaId==x.Id).Select(d=>new{d.Medicamento,d.Dosis,d.Frecuencia,d.Duracion,d.Presentacion,d.Indicaciones}).ToList()}).ToListAsync();

   var studies=await db.EstudiosMedicos.AsNoTracking().Where(x=>consultationIds.Contains(x.ConsultaId)).Select(x=>new{x.Id,x.ConsultaId,PacienteId=x.Consulta!.Cita!.PacienteId,Paciente=x.Consulta.Cita.Paciente!.Nombre,Medico=x.Consulta.Cita.Medico!.Nombre,x.Tipo,x.Indicaciones,x.Estado,FechaUtc=x.Consulta.FechaUtc,Resultado=db.ResultadosEstudio.Where(r=>r.EstudioMedicoId==x.Id).Select(r=>new{r.Id,r.Descripcion,r.FechaUtc,r.Revisado}).FirstOrDefault()}).ToListAsync();

   var followups=await db.Seguimientos.AsNoTracking().Where(x=>consultationIds.Contains(x.ConsultaId)).Select(x=>new{x.Id,x.ConsultaId,PacienteId=x.Consulta!.Cita!.PacienteId,Paciente=x.Consulta.Cita.Paciente!.Nombre,Medico=x.Consulta.Cita.Medico!.Nombre,UltimaConsulta=x.Consulta.FechaUtc,x.Fecha,x.Motivo,x.Indicaciones,x.Estado,x.CitaFuturaId}).ToListAsync();

   var payments=await db.Pagos.AsNoTracking().Where(x=>staff).OrderByDescending(x=>x.FechaUtc).Select(x=>new{x.Id,x.CitaId,Paciente=x.Cita!.Paciente!.Nombre,Medico=x.Cita.Medico!.Nombre,Servicio=x.Cita.Servicio!.Nombre,x.Monto,x.Metodo,x.Referencia,x.Estado,x.FechaUtc}).ToListAsync();

   var users=await db.Usuarios.AsNoTracking().Where(x=>admin).Select(x=>new{x.Id,x.Nombre,x.Correo,x.Rol,x.Activo}).ToListAsync();

   var logs=await db.Auditorias.AsNoTracking().Where(x=>admin).OrderByDescending(x=>x.FechaUtc).Take(500).Select(x=>new{x.Id,x.UsuarioId,x.Accion,x.Entidad,x.EntidadId,x.Descripcion,x.FechaUtc,Usuario=db.Usuarios.Where(u=>u.Id==x.UsuarioId).Select(u=>u.Nombre).FirstOrDefault(),Rol=db.Usuarios.Where(u=>u.Id==x.UsuarioId).Select(u=>u.Rol).FirstOrDefault()}).ToListAsync();

   var documents=await db.DocumentosPaciente.AsNoTracking().Where(d=>clinical&&pq.Any(p=>p.Id==d.PacienteId)).Select(d=>new{d.Id,d.PacienteId,d.Nombre,d.TipoMime,d.FechaUtc,Usuario=db.Usuarios.Where(u=>u.Id==d.UsuarioCargaId).Select(u=>u.Nombre).FirstOrDefault()}).ToListAsync();
   var clinic=await db.ConfiguracionesConsultorio.AsNoTracking().FirstOrDefaultAsync();

   return Results.Ok(new{patients,appointments,doctors,services,specialties,consultations,prescriptions,studies,followups,payments,users,logs,clinic,documents});

  });

  api.MapGet("/medicos/{id:int}/disponibilidad",async(int id,DateOnly fecha,AppDbContext db)=>{

   if(!await db.Medicos.AnyAsync(x=>x.Id==id&&x.Activo))return Results.NotFound();

   var zone=TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");

   var start=TimeZoneInfo.ConvertTimeToUtc(fecha.ToDateTime(TimeOnly.MinValue),zone);var end=start.AddDays(1);

   var occupied=await db.Citas.AsNoTracking().Where(x=>x.MedicoId==id&&x.Estado!="Cancelada"&&x.Estado!="No asistió"&&x.Inicio<end&&x.Fin>start).Select(x=>new{x.Inicio,x.Fin}).ToListAsync();

   var blocked=await db.BloqueosAgenda.AsNoTracking().Where(x=>x.MedicoId==id&&x.Inicio<end&&x.Fin>start).Select(x=>new{x.Inicio,x.Fin}).ToListAsync();

   var schedules=await db.HorariosMedico.AsNoTracking().Where(h=>h.MedicoId==id&&h.Activo).Select(h=>new{h.DiaSemana,h.Desde,h.Hasta}).ToListAsync();return Results.Ok(new{ocupados=occupied,bloqueados=blocked,horarios=schedules});

  });

  api.MapGet("/notificaciones",async(AppDbContext db,ClaimsPrincipal user)=>await db.Notificaciones.AsNoTracking().Where(x=>x.UsuarioId==Helpers.UserId(user)).OrderByDescending(x=>x.FechaUtc).Take(50).Select(x=>new{x.Id,x.Titulo,x.Mensaje,x.Leida,x.FechaUtc}).ToListAsync());

  api.MapPatch("/notificaciones/leidas",async(AppDbContext db,ClaimsPrincipal user)=>{await db.Notificaciones.Where(x=>x.UsuarioId==Helpers.UserId(user)&&!x.Leida).ExecuteUpdateAsync(p=>p.SetProperty(x=>x.Leida,true));return Results.NoContent();});

  api.MapPost("/pacientes/detalle",async(PatientDetails v,AppDbContext db,ClaimsPrincipal user)=>await SavePatient(null,v,db,user)).RequireAuthorization("Administracion");

  api.MapPut("/pacientes/{id:int}/detalle",async(int id,PatientDetails v,AppDbContext db,ClaimsPrincipal user)=>await SavePatient(id,v,db,user)).RequireAuthorization("Administracion");

  api.MapPatch("/pacientes/{id:int}/activo",async(int id,ActiveInput v,AppDbContext db,ClaimsPrincipal user)=>{var p=await db.Pacientes.FindAsync(id);if(p==null)return Results.NotFound();if(!v.Activo&&await db.Citas.AnyAsync(x=>x.PacienteId==id&&x.Inicio>DateTime.UtcNow&&x.Estado!="Cancelada"&&x.Estado!="No asistió"))return Helpers.Bad("Cancele primero las citas futuras del paciente.");p.Activo=v.Activo;Audit(db,user,"ESTADO","Paciente",id);await db.SaveChangesAsync();return Results.NoContent();}).RequireAuthorization("Administracion");

  api.MapPut("/usuarios/{id:int}",async(int id,UserEdit v,AppDbContext db,ClaimsPrincipal user)=>{

   if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Trim().Length>160||!Helpers.Email(v.Correo)||!new[]{"Administrador","Recepcionista","Medico","Paciente"}.Contains(v.Rol))return Helpers.Bad("Nombre, correo o rol inválidos.");

   await using var tx=await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);var u=await db.Usuarios.FindAsync(id);if(u==null)return Results.NotFound();

   if(u.Rol!=v.Rol&&(await db.Medicos.AnyAsync(x=>x.UsuarioId==id)||await db.Pacientes.AnyAsync(x=>x.UsuarioId==id)))return Helpers.Bad("No cambie el rol de una cuenta vinculada a un expediente o médico.");

   if(u.Rol=="Administrador"&&v.Rol!="Administrador"&&(id==Helpers.UserId(user)||await db.Usuarios.CountAsync(x=>x.Rol=="Administrador"&&x.Activo)<=1))return Helpers.Bad("No puede quitar su acceso ni el último administrador.");

   var mail=v.Correo.Trim().ToLowerInvariant();if(await db.Usuarios.AnyAsync(x=>x.Id!=id&&x.Correo==mail))return Results.Conflict(new{error="Correo duplicado."});u.Nombre=v.Nombre.Trim();u.Correo=mail;u.Rol=v.Rol;Audit(db,user,"ACTUALIZAR","Usuario",id);await db.SaveChangesAsync();await tx.CommitAsync();return Results.NoContent();

  }).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPatch("/usuarios/{id:int}/activo",async(int id,ActiveInput v,AppDbContext db,ClaimsPrincipal user)=>{await using var tx=await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);var u=await db.Usuarios.FindAsync(id);if(u==null)return Results.NotFound();if(!v.Activo&&(id==Helpers.UserId(user)||(u.Rol=="Administrador"&&await db.Usuarios.CountAsync(x=>x.Rol=="Administrador"&&x.Activo)<=1)))return Helpers.Bad("No puede desactivar su cuenta ni el último administrador.");u.Activo=v.Activo;Audit(db,user,"ESTADO","Usuario",id);await db.SaveChangesAsync();await tx.CommitAsync();return Results.NoContent();}).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPut("/medicos/{id:int}/detalle",async(int id,DoctorEdit v,AppDbContext db,ClaimsPrincipal user)=>{

   if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Trim().Length>160||string.IsNullOrWhiteSpace(v.Especialidad)||v.Especialidad.Length>100||string.IsNullOrWhiteSpace(v.Jvpm)||v.Jvpm.Length>50||(v.Horario??"").Length>200||!Phone(v.Telefono))return Helpers.Bad("Datos del médico inválidos.");var m=await db.Medicos.FindAsync(id);if(m==null)return Results.NotFound();if(!await db.Usuarios.AnyAsync(x=>x.Id==v.UsuarioId&&x.Rol=="Medico"&&x.Activo))return Helpers.Bad("Seleccione una cuenta activa de médico.");if(await db.Medicos.AnyAsync(x=>x.Id!=id&&(x.UsuarioId==v.UsuarioId||x.Jvpm==v.Jvpm.Trim())))return Results.Conflict(new{error="Cuenta o JVPM ya vinculados."});if(v.Horarios!=null){if(!AgendaRules.Valid(v.Horarios))return Helpers.Bad("Horario inválido.");var future=await db.Citas.AsNoTracking().Where(c=>c.MedicoId==id&&c.Inicio>DateTime.UtcNow&&c.Estado!="Cancelada"&&c.Estado!="No asistió").Select(c=>new{c.Inicio,c.Fin}).ToListAsync();if(future.Any(c=>!AgendaRules.Fits(c.Inicio,c.Fin,v.Horarios)))return Helpers.Bad("El nuevo horario excluye citas futuras. Reprográmelas primero.");var old=await db.HorariosMedico.Where(h=>h.MedicoId==id).ToListAsync();db.HorariosMedico.RemoveRange(old);db.HorariosMedico.AddRange(v.Horarios.Select(h=>new HorarioMedico{MedicoId=id,DiaSemana=h.DiaSemana,Desde=h.Desde,Hasta=h.Hasta}));}m.Nombre=v.Nombre.Trim();m.Especialidad=v.Especialidad.Trim();m.Jvpm=v.Jvpm.Trim();m.UsuarioId=v.UsuarioId;m.Telefono=v.Telefono??"";m.Horario=v.Horario??"";Audit(db,user,"ACTUALIZAR","Medico",id);await db.SaveChangesAsync();return Results.NoContent();

  }).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPatch("/medicos/{id:int}/activo",async(int id,ActiveInput v,AppDbContext db,ClaimsPrincipal user)=>{var m=await db.Medicos.FindAsync(id);if(m==null)return Results.NotFound();if(!v.Activo&&await db.Citas.AnyAsync(x=>x.MedicoId==id&&x.Inicio>DateTime.UtcNow&&x.Estado!="Cancelada"&&x.Estado!="No asistió"))return Helpers.Bad("Cancele primero las citas futuras del médico.");m.Activo=v.Activo;Audit(db,user,"ESTADO","Medico",id);await db.SaveChangesAsync();return Results.NoContent();}).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPost("/especialidades",async(SpecialtyInput v,AppDbContext db,ClaimsPrincipal user)=>{if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Trim().Length>100||(v.Descripcion??"").Length>500)return Helpers.Bad("Especialidad inválida.");if(await db.Especialidades.AnyAsync(x=>x.Nombre==v.Nombre.Trim()))return Results.Conflict(new{error="Especialidad duplicada."});var s=new Especialidad{Nombre=v.Nombre.Trim(),Descripcion=v.Descripcion??""};db.Especialidades.Add(s);await db.SaveChangesAsync();Audit(db,user,"CREAR","Especialidad",s.Id);await db.SaveChangesAsync();return Results.Created($"/api/especialidades/{s.Id}",new{s.Id});}).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPatch("/especialidades/{id:int}/activo",async(int id,ActiveInput v,AppDbContext db,ClaimsPrincipal user)=>{var s=await db.Especialidades.FindAsync(id);if(s==null)return Results.NotFound();s.Activa=v.Activo;Audit(db,user,"ESTADO","Especialidad",id);await db.SaveChangesAsync();return Results.NoContent();}).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPut("/configuracion",async(ClinicInput v,AppDbContext db,ClaimsPrincipal user)=>{if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Length>150||(v.Direccion??"").Length>300||!Phone(v.Telefono))return Helpers.Bad("Datos de consultorio inválidos.");if((!string.IsNullOrWhiteSpace(v.Correo)&&!Helpers.Email(v.Correo))||(v.Horario??"").Length>200||v.DuracionMinutos is <5 or >240||v.AnticipoDias is <1 or >730||v.CancelacionHoras is <0 or >720)return Helpers.Bad("Configuración de citas inválida.");var c=await db.ConfiguracionesConsultorio.FirstOrDefaultAsync();if(c==null){c=new();db.ConfiguracionesConsultorio.Add(c);}c.Nombre=v.Nombre.Trim();c.Direccion=v.Direccion??"";c.Telefono=v.Telefono;c.Correo=v.Correo??"";c.Horario=v.Horario??"";c.DuracionMinutos=v.DuracionMinutos;c.AnticipoDias=v.AnticipoDias;c.CancelacionHoras=v.CancelacionHoras;c.PermitirOnline=v.PermitirOnline;await db.SaveChangesAsync();Audit(db,user,"ACTUALIZAR","Configuracion",c.Id);await db.SaveChangesAsync();return Results.NoContent();}).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPut("/especialidades/{id:int}",async(int id,SpecialtyInput v,AppDbContext db,ClaimsPrincipal user)=>{if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Length>100||(v.Descripcion??"").Length>500)return Helpers.Bad("Datos inválidos.");var x=await db.Especialidades.FindAsync(id);if(x==null)return Results.NotFound();if(await db.Especialidades.AnyAsync(s=>s.Id!=id&&s.Nombre==v.Nombre.Trim()))return Results.Conflict(new{error="Especialidad duplicada."});var previous=x.Nombre;x.Nombre=v.Nombre.Trim();x.Descripcion=v.Descripcion??"";var medicos=await db.Medicos.Where(m=>m.Especialidad==previous).ToListAsync();foreach(var m in medicos)m.Especialidad=x.Nombre;Audit(db,user,"ACTUALIZAR","Especialidad",id);await db.SaveChangesAsync();return Results.NoContent();}).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPost("/servicios/detalle",async(ServiceDetails v,AppDbContext db,ClaimsPrincipal user)=>await SaveService(null,v,db,user)).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPut("/servicios/{id:int}/detalle",async(int id,ServiceDetails v,AppDbContext db,ClaimsPrincipal user)=>await SaveService(id,v,db,user)).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPatch("/servicios/{id:int}/activo",async(int id,ActiveInput v,AppDbContext db,ClaimsPrincipal user)=>{var s=await db.Servicios.FindAsync(id);if(s==null)return Results.NotFound();s.Activo=v.Activo;Audit(db,user,"ESTADO","Servicio",id);await db.SaveChangesAsync();return Results.NoContent();}).RequireAuthorization(p=>p.RequireRole("Administrador"));

  api.MapPut("/perfil",async(PatientDetails v,AppDbContext db,ClaimsPrincipal user)=>{var patient=await db.Pacientes.FirstOrDefaultAsync(p=>p.UsuarioId==Helpers.UserId(user));if(patient==null)return Results.NotFound();if(v.Documento!=patient.Documento||v.FechaNacimiento!=patient.FechaNacimiento||v.Nombre!=patient.Nombre)return Helpers.Bad("Solicite a recepción los cambios de identidad.");return await SavePatient(patient.Id,v,db,user);}).RequireAuthorization(p=>p.RequireRole("Paciente"));

  api.MapPost("/auth/password",async(PasswordInput v,AppDbContext db,ClaimsPrincipal user)=>{if(!Helpers.StrongPassword(v.Nueva))return Helpers.Bad("Use 12 caracteres o más, mayúscula, minúscula, número y símbolo (máximo 72 bytes).");var u=await db.Usuarios.FindAsync(Helpers.UserId(user));if(u==null||!BCrypt.Net.BCrypt.Verify(v.Actual,u.PasswordHash))return Helpers.Bad("Contraseña actual incorrecta.");u.PasswordHash=BCrypt.Net.BCrypt.HashPassword(v.Nueva,12);Audit(db,user,"CONTRASEÑA","Usuario",u.Id);await db.SaveChangesAsync();return Results.NoContent();});

  api.MapPost("/estudios/{id:int}/resultado",async(int id,StudyResultInput v,AppDbContext db,ClaimsPrincipal user)=>{if(string.IsNullOrWhiteSpace(v.Descripcion)||v.Descripcion.Length>2500)return Helpers.Bad("Resultado obligatorio, máximo 2500 caracteres.");var s=await db.EstudiosMedicos.Include(x=>x.Consulta).ThenInclude(x=>x!.Cita).ThenInclude(x=>x!.Medico).FirstOrDefaultAsync(x=>x.Id==id);if(s==null)return Results.NotFound();if(s.Consulta!.Cita!.Medico!.UsuarioId!=Helpers.UserId(user))return Results.Forbid();if(await db.ResultadosEstudio.AnyAsync(x=>x.EstudioMedicoId==id))return Results.Conflict(new{error="El resultado ya está registrado."});db.ResultadosEstudio.Add(new ResultadoEstudio{EstudioMedicoId=id,Descripcion=v.Descripcion.Trim()});s.Estado="Resultado disponible";Audit(db,user,"RESULTADO","Estudio",id);await db.SaveChangesAsync();return Results.NoContent();}).RequireAuthorization(p=>p.RequireRole("Medico"));

  api.MapPatch("/estudios/{id:int}/revisar",async(int id,AppDbContext db,ClaimsPrincipal user)=>{var s=await db.EstudiosMedicos.FirstOrDefaultAsync(x=>x.Id==id&&x.Consulta!.Cita!.Medico!.UsuarioId==Helpers.UserId(user));if(s==null)return Results.NotFound();var r=await db.ResultadosEstudio.FirstOrDefaultAsync(x=>x.EstudioMedicoId==id);if(r==null)return Helpers.Bad("Registre primero el resultado.");r.Revisado=true;s.Estado="Revisado";Audit(db,user,"REVISAR","Estudio",id);await db.SaveChangesAsync();return Results.NoContent();}).RequireAuthorization(p=>p.RequireRole("Medico"));

  api.MapPatch("/seguimientos/{id:int}/estado",async(int id,FollowStatus v,AppDbContext db,ClaimsPrincipal user)=>{var f=await db.Seguimientos.Include(x=>x.Consulta).ThenInclude(x=>x!.Cita).FirstOrDefaultAsync(x=>x.Id==id&&x.Consulta!.Cita!.Medico!.UsuarioId==Helpers.UserId(user));if(f==null)return Results.NotFound();if(v.Estado is not ("Programado" or "Completado" or "Pendiente"))return Helpers.Bad("Estado inválido.");if(v.Estado=="Programado"&&!await db.Citas.AnyAsync(x=>x.Id==v.CitaId&&x.PacienteId==f.Consulta!.Cita!.PacienteId&&x.Estado!="Cancelada"))return Helpers.Bad("Seleccione una cita del mismo paciente.");f.Estado=v.Estado;f.CitaFuturaId=v.Estado=="Programado"?v.CitaId:null;Audit(db,user,"ESTADO","Seguimiento",id);await db.SaveChangesAsync();return Results.NoContent();}).RequireAuthorization(p=>p.RequireRole("Medico"));

 }

 static async Task<IResult> SaveService(int? id,ServiceDetails v,AppDbContext db,ClaimsPrincipal user){if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Length>140||(v.Descripcion??"").Length>500||v.Precio<0||v.Precio>100000||decimal.Round(v.Precio,2)!=v.Precio||v.DuracionMinutos is <5 or >240)return Helpers.Bad("Servicio, precio o duración inválidos.");if(await db.Servicios.AnyAsync(x=>x.Id!=(id??0)&&x.Nombre==v.Nombre.Trim()))return Results.Conflict(new{error="Servicio duplicado."});var s=id.HasValue?await db.Servicios.FindAsync(id.Value):new Servicio();if(s==null)return Results.NotFound();s.Nombre=v.Nombre.Trim();s.Descripcion=v.Descripcion??"";s.Precio=v.Precio;s.DuracionMinutos=v.DuracionMinutos;if(!id.HasValue)db.Servicios.Add(s);await db.SaveChangesAsync();Audit(db,user,id.HasValue?"ACTUALIZAR":"CREAR","Servicio",s.Id);await db.SaveChangesAsync();return Results.Ok(new{s.Id});}

 static bool Phone(string? value)=>string.IsNullOrWhiteSpace(value)||System.Text.RegularExpressions.Regex.IsMatch(value,@"^\+?[0-9 ()-]{8,20}$");

 static async Task<IResult> SavePatient(int? id,PatientDetails v,AppDbContext db,ClaimsPrincipal user){

  if(string.IsNullOrWhiteSpace(v.Nombre)||v.Nombre.Trim().Length is <3 or >160||string.IsNullOrWhiteSpace(v.Documento)||v.Documento.Trim().Length is <5 or >30||v.FechaNacimiento<new DateOnly(1900,1,1)||v.FechaNacimiento>DateOnly.FromDateTime(DateTime.Today)||!Phone(v.Telefono)||!Phone(v.ContactoTelefono)||(!string.IsNullOrWhiteSpace(v.Correo)&&!Helpers.Email(v.Correo))||(v.Sexo??"").Length>20||(v.Direccion??"").Length>300||(v.Notas??"").Length>1500||(v.ContactoNombre??"").Length>160||(v.Parentesco??"").Length>70)return Helpers.Bad("Revise nombres, documento, fecha, teléfonos y longitudes.");

  if(!string.IsNullOrWhiteSpace(v.Sexo)&&!new[]{"Masculino","Femenino","Otro"}.Contains(v.Sexo))return Helpers.Bad("Sexo inválido.");

  if(new[]{v.ContactoNombre,v.ContactoTelefono,v.Parentesco}.Any(x=>!string.IsNullOrWhiteSpace(x))&&new[]{v.ContactoNombre,v.ContactoTelefono,v.Parentesco}.Any(string.IsNullOrWhiteSpace))return Helpers.Bad("Complete todos los datos del contacto de emergencia.");

  await using var tx=await db.Database.BeginTransactionAsync();var p=id.HasValue?await db.Pacientes.FindAsync(id.Value):new Paciente();if(p==null)return Results.NotFound();if(await db.Pacientes.AnyAsync(x=>x.Id!=p.Id&&x.Documento==v.Documento.Trim()))return Results.Conflict(new{error="Documento duplicado."});

  p.Nombre=v.Nombre.Trim();p.Documento=v.Documento.Trim();p.FechaNacimiento=v.FechaNacimiento;p.Telefono=v.Telefono?.Trim()??"";p.Correo=v.Correo?.Trim().ToLowerInvariant()??"";p.Sexo=v.Sexo??"";p.Direccion=v.Direccion?.Trim()??"";p.Notas=v.Notas?.Trim()??"";if(!id.HasValue)db.Pacientes.Add(p);await db.SaveChangesAsync();

  var contact=await db.ContactosEmergencia.FirstOrDefaultAsync(x=>x.PacienteId==p.Id);if(!string.IsNullOrWhiteSpace(v.ContactoNombre)){if(contact==null){contact=new ContactoEmergencia{PacienteId=p.Id};db.ContactosEmergencia.Add(contact);}contact.Nombre=v.ContactoNombre.Trim();contact.Telefono=v.ContactoTelefono!.Trim();contact.Parentesco=v.Parentesco!.Trim();}else if(contact!=null)db.ContactosEmergencia.Remove(contact);

  Audit(db,user,id.HasValue?"ACTUALIZAR":"CREAR","Paciente",p.Id);await db.SaveChangesAsync();await tx.CommitAsync();return Results.Ok(new{p.Id});

 }

}

