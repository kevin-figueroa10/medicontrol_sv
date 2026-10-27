using System.Security.Cryptography;
using System.Text.Json;
using MediControlSV.Api.Data;
using MediControlSV.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

const string prefix="PRUEBA-MCSV-";
var root=Directory.GetCurrentDirectory();
var settings=Path.Combine(root,"backend","MediControlSV.Api","appsettings.Development.json");
if(!File.Exists(settings))throw new InvalidOperationException("Ejecute desde la raíz de MediControlSV_FaseII.");
using var config=JsonDocument.Parse(await File.ReadAllTextAsync(settings));
var connection=config.RootElement.GetProperty("ConnectionStrings").GetProperty("Default").GetString()!;
var target=new SqlConnectionStringBuilder(connection);
if(target.InitialCatalog!="MediControlSV_FaseII"||!new[]{"localhost",".","(local)"}.Contains(target.DataSource,StringComparer.OrdinalIgnoreCase))
 throw new InvalidOperationException("Este cargador solo agrega datos a MediControlSV_FaseII en SQL Server local.");
await using var db=new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlServer(connection).Options);
if(!await db.Database.CanConnectAsync())throw new InvalidOperationException("No hay conexión con SQL Server.");
if(await db.Pacientes.AnyAsync(p=>p.Documento.StartsWith(prefix))){
 Console.WriteLine("El lote PRUEBA-MCSV ya existe. No se duplicó ni se modificó ningún registro.");
 await Summary(db);return;
}
var admin=await db.Usuarios.Where(u=>u.Rol=="Administrador"&&u.Activo).Select(u=>(int?)u.Id).FirstOrDefaultAsync();
if(admin==null)throw new InvalidOperationException("Primero cree la cuenta administradora desde la app.");
var zone=TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");
var today=DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow,zone));
DateTime At(DateOnly day,int hour,int minute=0)=>TimeZoneInfo.ConvertTimeToUtc(day.ToDateTime(new TimeOnly(hour,minute)),zone);
var password="Demo!9"+Convert.ToHexString(RandomNumberGenerator.GetBytes(8)).ToLowerInvariant();
var hash=BCrypt.Net.BCrypt.HashPassword(password,12);
var accounts=new List<Usuario>();
var doctors=new List<Medico>();
var patients=new List<Paciente>();
var appointments=new List<Cita>();
var consultations=new List<Consulta>();
var names=new[]{"Ana Lucía Mendoza","Carlos Alberto Rivera","María Elena García","Roberto Flores Díaz","Sofía Isabel Torres","Luis Fernando Castro","Valentina López Ramos","Diego Alejandro Cruz","Isabella Ramírez Ortiz","Marco Antonio Vásquez","Camila Fernanda Ruiz","José Manuel Hernández","Daniela Patricia Reyes","Andrés Felipe Morales","Gabriela Alejandra Díaz","Sebastián Enrique Lara","Lucía Beatriz Peña","Miguel Ángel Molina"};
var doctorNames=new[]{"Dra. Laura Benítez","Dr. Eduardo Salazar","Dra. Patricia Fuentes","Dr. Samuel Rivas"};
var specialtyNames=new[]{"Medicina general (PRUEBA)","Cardiología (PRUEBA)","Pediatría (PRUEBA)","Dermatología (PRUEBA)"};
var serviceNames=new[]{"Consulta general (PRUEBA)","Consulta cardiológica (PRUEBA)","Control pediátrico (PRUEBA)","Consulta dermatológica (PRUEBA)"};
var prices=new[]{25m,45m,20m,35m};
await using var tx=await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
for(var i=0;i<4;i++){
 var u=new Usuario{Nombre=doctorNames[i]+" (PRUEBA)",Correo=$"medico{i+1}@prueba.invalid",PasswordHash=hash,Rol="Medico"};
 accounts.Add(u);db.Usuarios.Add(u);
 db.Especialidades.Add(new Especialidad{Nombre=specialtyNames[i],Descripcion="Catálogo ficticio para practicar en el sistema."});
}
var reception=new Usuario{Nombre="Recepción (PRUEBA)",Correo="recepcion@prueba.invalid",PasswordHash=hash,Rol="Recepcionista"};accounts.Add(reception);db.Usuarios.Add(reception);
for(var i=0;i<3;i++){
 var u=new Usuario{Nombre=names[i]+" (PRUEBA)",Correo=$"paciente{i+1}@prueba.invalid",PasswordHash=hash,Rol="Paciente"};accounts.Add(u);db.Usuarios.Add(u);
}
await db.SaveChangesAsync();
for(var i=0;i<4;i++){
 var m=new Medico{Nombre=doctorNames[i]+" (PRUEBA)",UsuarioId=accounts[i].Id,Especialidad=specialtyNames[i],Jvpm=prefix+$"JVPM-{i+1:D3}",Telefono="0000-0000",Horario="Lun–Dom 08:00–17:00 (PRUEBA)"};
 doctors.Add(m);db.Medicos.Add(m);
}
var services=Enumerable.Range(0,4).Select(i=>new Servicio{Nombre=serviceNames[i],Descripcion="Servicio de prueba, sin atención ni cobro real.",Precio=prices[i],DuracionMinutos=30}).ToList();db.Servicios.AddRange(services);
for(var i=0;i<names.Length;i++){
 var birth=today.AddYears(-(i==6?8:i==7?12:22+i*2)).AddDays(-30);
 var p=new Paciente{Nombre=names[i]+" (PRUEBA)",Documento=prefix+$"{i+1:D3}",FechaNacimiento=birth,Sexo=i%2==0?"Femenino":"Masculino",Telefono="0000-0000",Correo=$"paciente{i+1}@prueba.invalid",Direccion=$"Dirección ficticia #{i+1}, datos de prueba",Notas="REGISTRO FICTICIO. Solo para practicar; no corresponde a una persona real.",Activo=i<16,UsuarioId=i<3?accounts[5+i].Id:null};patients.Add(p);db.Pacientes.Add(p);
}
await db.SaveChangesAsync();
foreach(var p in patients)db.ContactosEmergencia.Add(new ContactoEmergencia{PacienteId=p.Id,Nombre="Contacto ficticio (PRUEBA)",Parentesco="Familiar de prueba",Telefono="0000-0000"});
foreach(var m in doctors){
 for(var d=0;d<7;d++)db.HorariosMedico.Add(new HorarioMedico{MedicoId=m.Id,DiaSemana=d,Desde=new TimeOnly(8,0),Hasta=new TimeOnly(17,0)});
 db.BloqueosAgenda.Add(new BloqueoAgenda{MedicoId=m.Id,Inicio=At(today.AddDays(2),13),Fin=At(today.AddDays(2),14),Motivo="Bloqueo de agenda (PRUEBA)"});
}
Cita AddAppointment(Paciente p,int doctor,DateOnly date,int hour,string state,int minute=0){
 var service=services[doctor];
 var a=new Cita{PacienteId=p.Id,MedicoId=doctors[doctor].Id,ServicioId=service.Id,PrecioAcordado=service.Precio,Inicio=At(date,hour,minute),Fin=At(date,hour,minute).AddMinutes(30),Estado=state,Motivo="Cita de prueba para explorar el sistema.",CreadaUtc=At(date.AddDays(-5),8)};
 appointments.Add(a);db.Citas.Add(a);return a;
}
// Historical records populate the six monthly report panels without fake UI values.
for(var month=0;month<6;month++){
 var first=new DateOnly(today.Year,today.Month,1).AddMonths(-5+month);
 var historical=month==5?today.AddDays(-7):first.AddDays(9);
 if(historical>=today)historical=today.AddDays(-1);
 AddAppointment(patients[(month*2)%16],month%4,historical,9,"Finalizada");
 AddAppointment(patients[(month*2+1)%16],(month+1)%4,historical,10,"Finalizada");
 AddAppointment(patients[(month+4)%16],(month+2)%4,historical,11,month%2==0?"Cancelada":"No asistió");
}
var states=new[]{"Confirmada","En espera","En consulta","Finalizada","Confirmada","En espera","Finalizada","Cancelada"};
for(var i=0;i<states.Length;i++)AddAppointment(patients[i],i%4,today,i<6?8+i:14+i-6,states[i]);
for(var d=1;d<=6;d++)for(var slot=0;slot<2;slot++)AddAppointment(patients[((d-1)*2+slot)%16],(d+slot)%4,today.AddDays(d),9+slot,"Confirmada");
await db.SaveChangesAsync();
foreach(var a in appointments){
 db.HistorialCitas.Add(new HistorialCita{CitaId=a.Id,UsuarioId=admin,EstadoNuevo="Confirmada",FechaUtc=a.CreadaUtc,Motivo="Alta de datos de prueba"});
 if(a.Estado is "En espera" or "En consulta" or "Finalizada")db.HistorialCitas.Add(new HistorialCita{CitaId=a.Id,UsuarioId=reception.Id,EstadoAnterior="Confirmada",EstadoNuevo="En espera",FechaUtc=a.Inicio.AddMinutes(-15),Motivo="Llegada de prueba"});
 if(a.Estado is "En consulta" or "Finalizada")db.HistorialCitas.Add(new HistorialCita{CitaId=a.Id,UsuarioId=doctors.First(m=>m.Id==a.MedicoId).UsuarioId,EstadoAnterior="En espera",EstadoNuevo="En consulta",FechaUtc=a.Inicio,Motivo="Atención de prueba"});
 if(a.Estado is "Finalizada" or "Cancelada" or "No asistió")db.HistorialCitas.Add(new HistorialCita{CitaId=a.Id,UsuarioId=admin,EstadoAnterior=a.Estado=="Finalizada"?"En consulta":"Confirmada",EstadoNuevo=a.Estado,FechaUtc=a.Fin,Motivo="Estado de prueba"});
 if(a.Estado=="Finalizada"){
  var c=new Consulta{CitaId=a.Id,Motivo="Consulta ficticia para probar el expediente.",Antecedentes="Antecedentes ficticios de demostración.",Evaluacion="Evaluación de prueba; no representa una valoración médica.",Diagnostico="Registro clínico demostrativo (PRUEBA)",Tratamiento="Sin tratamiento real. Contenido demostrativo.",Recomendaciones="No utilizar estos datos para decisiones clínicas.",Observaciones="Datos sintéticos cargados por solicitud del usuario.",Estado="Finalizada",FechaUtc=a.Inicio};
  consultations.Add(c);db.Consultas.Add(c);
 }
 var recipient=patients.First(p=>p.Id==a.PacienteId).UsuarioId;
 if(a.Inicio>=At(today,0)&&recipient.HasValue)db.Notificaciones.Add(new Notificacion{UsuarioId=recipient.Value,CitaId=a.Id,Titulo="Cita de prueba",Mensaje=$"Registro demostrativo #{a.Id}. Sin atención real.",FechaUtc=DateTime.UtcNow});
}
await db.SaveChangesAsync();
for(var i=0;i<consultations.Count;i++){
 var c=consultations[i];var a=appointments.First(a=>a.Id==c.CitaId);
 db.SignosVitales.Add(new SignosVitales{ConsultaId=c.Id,Temperatura=36.5m+(i%3)*0.1m,PresionSistolica=110+(i%4)*5,PresionDiastolica=70+(i%3)*5,FrecuenciaCardiaca=65+i%10,Saturacion=97+i%3,PesoKg=55+i,AlturaCm=160+i%15});
 var r=new Receta{ConsultaId=c.Id,MedicoId=a.MedicoId,Indicaciones="RECETA FICTICIA: solo demostración, sin validez ni tratamiento real.",FechaUtc=c.FechaUtc};db.Recetas.Add(r);
 db.DetallesReceta.Add(new DetalleReceta{Receta=r,Medicamento="Medicamento demostrativo (NO USAR)",Presentacion="Presentación ficticia",Dosis="Dosis de prueba, no administrar",Frecuencia="Sin pauta real",Duracion="Solo demostración",Indicaciones="No representa una prescripción médica."});
 if(i%2==0){
  var s=new EstudioMedico{ConsultaId=c.Id,Tipo=i%4==0?"Hemograma (PRUEBA)":"Estudio de imagen (PRUEBA)",Indicaciones="Orden ficticia para probar los estados.",Estado=i%3==0?"Solicitado":i%3==1?"Resultado disponible":"Revisado"};db.EstudiosMedicos.Add(s);
  if(s.Estado!="Solicitado")db.ResultadosEstudio.Add(new ResultadoEstudio{EstudioMedico=s,Descripcion="Resultado ficticio para demostración. No corresponde a un estudio real.",Revisado=s.Estado=="Revisado",FechaUtc=c.FechaUtc.AddDays(1)});
 }
 var future=appointments.FirstOrDefault(x=>x.PacienteId==a.PacienteId&&x.Inicio>At(today.AddDays(1),0)&&x.Estado=="Confirmada");
 var follow=new Seguimiento{ConsultaId=c.Id,Fecha=i%3==0?today.AddDays(-2):today.AddDays(7+i),Motivo="Seguimiento demostrativo (PRUEBA)",Indicaciones="Sin indicaciones médicas reales.",Estado=i%4==0?"Completado":i%3==1&&future!=null?"Programado":"Pendiente",CitaFuturaId=i%4!=0&&i%3==1?future?.Id:null};
 if(follow.Estado=="Programado")follow.Fecha=DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(future!.Inicio,zone));db.Seguimientos.Add(follow);
 var amount=i%3==0?a.PrecioAcordado/2:a.PrecioAcordado;
 db.Pagos.Add(new Pago{CitaId=a.Id,Monto=amount,Metodo=new[]{"Efectivo","Tarjeta","Transferencia"}[i%3],Referencia=$"PRUEBA-SIN-COBRO-{i+1:D3}",FechaUtc=a.Fin,Estado="Pagado"});
}
foreach(var a in appointments.TakeLast(3))db.Pagos.Add(new Pago{CitaId=a.Id,Monto=5m,Metodo="Efectivo",Referencia="Anticipo ficticio sin cobro real",FechaUtc=DateTime.UtcNow});
foreach(var p in patients)db.Auditorias.Add(new Auditoria{UsuarioId=admin,Accion="CARGAR_PRUEBAS",Entidad="Paciente",EntidadId=p.Id,Descripcion="Lote PRUEBA-MCSV: datos ficticios solicitados por el usuario."});
foreach(var a in appointments)db.Auditorias.Add(new Auditoria{UsuarioId=admin,Accion="CARGAR_PRUEBAS",Entidad="Cita",EntidadId=a.Id,Descripcion="Lote PRUEBA-MCSV: agenda de demostración."});
await db.SaveChangesAsync();
await Summary(db);
await tx.CommitAsync();
Console.WriteLine("CUENTAS DE PRUEBA CREADAS:");
foreach(var u in accounts)Console.WriteLine($"{u.Rol}: {u.Correo}");
Console.WriteLine("CLAVE COMÚN DE LAS CUENTAS DE PRUEBA: "+password);
Console.WriteLine("La cuenta administradora y los registros anteriores no se modificaron.");

static async Task Summary(AppDbContext db){
 var ps=db.Pacientes.Where(p=>p.Documento.StartsWith("PRUEBA-MCSV-")).Select(p=>p.Id);
 var ms=db.Medicos.Where(m=>m.Jvpm.StartsWith("PRUEBA-MCSV-")).Select(m=>m.Id);
 var ap=db.Citas.Where(c=>ps.Contains(c.PacienteId)&&ms.Contains(c.MedicoId)).Select(c=>c.Id);
 var cs=db.Consultas.Where(c=>ap.Contains(c.CitaId)).Select(c=>c.Id);
 Console.WriteLine(JsonSerializer.Serialize(new{pacientes=await ps.CountAsync(),medicos=await ms.CountAsync(),citas=await ap.CountAsync(),consultas=await cs.CountAsync(),recetas=await db.Recetas.CountAsync(r=>cs.Contains(r.ConsultaId)),estudios=await db.EstudiosMedicos.CountAsync(e=>cs.Contains(e.ConsultaId)),seguimientos=await db.Seguimientos.CountAsync(s=>cs.Contains(s.ConsultaId)),pagos=await db.Pagos.CountAsync(p=>ap.Contains(p.CitaId))}));
 var invalid=await db.Pagos.Where(p=>ap.Contains(p.CitaId)&&p.Estado=="Pagado").GroupBy(p=>p.CitaId).Select(g=>new{Id=g.Key,Total=g.Sum(p=>p.Monto)}).Join(db.Citas,g=>g.Id,c=>c.Id,(g,c)=>new{g.Total,c.PrecioAcordado}).AnyAsync(x=>x.Total>x.PrecioAcordado);
 if(invalid)throw new InvalidOperationException("Se detectó un pago superior al precio de su cita.");
 Console.WriteLine("Verificación: relaciones recuperables y pagos dentro del precio acordado.");
}
