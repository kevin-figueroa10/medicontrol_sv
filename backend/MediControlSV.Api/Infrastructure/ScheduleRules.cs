namespace MediControlSV.Api.Infrastructure;
public sealed record ScheduleInput(int DiaSemana,TimeOnly Desde,TimeOnly Hasta);
public static class ScheduleRules {
 public static readonly TimeZoneInfo Zone=TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");
 public static bool Fits(DateTime inicio,DateTime fin,IEnumerable<ScheduleInput> schedules){
  if(fin<=inicio)return false;
  var a=TimeZoneInfo.ConvertTimeFromUtc(Helpers.Utc(inicio),Zone);var b=TimeZoneInfo.ConvertTimeFromUtc(Helpers.Utc(fin),Zone);
  return a.Date==b.Date&&schedules.Any(s=>s.DiaSemana==(int)a.DayOfWeek&&TimeOnly.FromDateTime(a)>=s.Desde&&TimeOnly.FromDateTime(b)<=s.Hasta);
 }
}
