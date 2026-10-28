using MediControlSV.Api.Infrastructure;
var count=0;
void Check(bool condition,string label){if(!condition)throw new Exception(label);count++;}
string[] states=["Confirmada","En espera","En consulta","Finalizada","Cancelada","No asistió"];
string[] roles=["Administrador","Recepcionista","Medico","Paciente","Desconocido"];
foreach(var role in roles)foreach(var current in states)foreach(var next in states){
 var expected=role switch {
 "Administrador" or "Recepcionista" => (current=="Confirmada"&&new[]{"En espera","Cancelada","No asistió"}.Contains(next))||(current=="En espera"&&new[]{"Cancelada","No asistió"}.Contains(next)),
 "Medico" => current=="En espera"&&next=="En consulta"||current=="En consulta"&&next=="Finalizada",
 "Paciente" => new[]{"Confirmada","En espera"}.Contains(current)&&next=="Cancelada",
 _=>false};
 Check(Helpers.CanTransition(current,next,role)==expected,$"Transición {role}: {current} → {next}");
}
Check(!Helpers.StrongPassword(null),"Contraseña nula");
Check(!Helpers.StrongPassword("abc"),"Contraseña débil");
Check(Helpers.StrongPassword("ClaveSegura!2026"),"Contraseña válida");
Check(!Helpers.StrongPassword("ClaveSegura!2026"+new string('á',40)),"Límite BCrypt en bytes");
Check(!Helpers.Email(null),"Correo nulo");
Check(!Helpers.Email("nombre <a@b.com>"),"Correo con nombre");
Check(Helpers.Email("persona@example.com"),"Correo válido");
Check(Helpers.Utc(new DateTime(2026,10,23)).Kind==DateTimeKind.Utc,"Fechas SQL en UTC");
Console.WriteLine($"OK: {count} comprobaciones de reglas de acceso, estados y validaciones.");
var rescheduleNow=new DateTime(2026,10,28,12,0,0,DateTimeKind.Utc);
foreach(var role in roles)foreach(var state in states){
 var staff=role is "Administrador" or "Recepcionista";
 var expected=(staff||role=="Paciente")&&state=="Confirmada"||staff&&(state=="En espera"||state=="No asistió");
 Check(Helpers.CanReschedule(state,rescheduleNow.AddDays(-1),role,rescheduleNow)==expected,$"Reprogramación vencida {role}/{state}");
}
Check(!Helpers.CanReschedule("En espera",rescheduleNow,"Recepcionista",rescheduleNow),"No reprogramar espera del día como vencida");
Check(Helpers.CanReschedule("En espera",new DateTime(2026,10,28,5,59,0,DateTimeKind.Utc),"Recepcionista",new DateTime(2026,10,28,6,1,0,DateTimeKind.Utc)),"Cambio de día de El Salvador");
Console.WriteLine($"OK: {count} comprobaciones, incluida reprogramación por rol y zona horaria.");
