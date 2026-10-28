using System.Security.Claims;
using System.Text.RegularExpressions;
namespace MediControlSV.Api.Infrastructure;
public static class Helpers {
 public static bool CanReschedule(string state,DateTime start,string? role,DateTime now){
  if(role is not ("Administrador" or "Recepcionista" or "Paciente"))return false;
  if(state=="Confirmada")return true;
  if(role=="Paciente")return false;
  var zone=TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");
  var pastDay=TimeZoneInfo.ConvertTimeFromUtc(Utc(start),zone).Date<TimeZoneInfo.ConvertTimeFromUtc(Utc(now),zone).Date;
  return state=="No asistió"||(state=="En espera"&&pastDay);
 }
 public static bool StrongPassword(string? value)=>value is not null && value.Length>=12 && EncodingLength(value)<=72 && value.Any(char.IsUpper)&&value.Any(char.IsLower)&&value.Any(char.IsDigit)&&value.Any(c=>!char.IsLetterOrDigit(c));
 static int EncodingLength(string value)=>System.Text.Encoding.UTF8.GetByteCount(value);
 public static bool Email(string? value)=>!string.IsNullOrWhiteSpace(value) && value.Length<=200 && System.Net.Mail.MailAddress.TryCreate(value,out var x)&&x.Address==value;
 public static DateTime Utc(DateTime value)=>value.Kind==DateTimeKind.Unspecified?DateTime.SpecifyKind(value,DateTimeKind.Utc):value.ToUniversalTime();
 public static bool CanTransition(string current,string next,string? role)=>role switch {
  "Paciente" => next=="Cancelada" && current is "Confirmada" or "En espera",
  "Medico" => (current=="En espera" && next=="En consulta") || (current=="En consulta" && next=="Finalizada"),
  "Administrador" or "Recepcionista" => (current=="Confirmada" && next is "En espera" or "Cancelada" or "No asistió") || (current=="En espera" && next is "Cancelada" or "No asistió"),
  _=>false
 };
 public static int? UserId(ClaimsPrincipal user)=>int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier),out var x)?x:null;
 public static string? Role(ClaimsPrincipal user)=>user.FindFirstValue(ClaimTypes.Role);
 public static IResult Bad(string message)=>Results.BadRequest(new {error=message});
}
