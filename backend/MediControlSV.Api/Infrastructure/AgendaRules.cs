using MediControlSV.Api.Data;
using MediControlSV.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace MediControlSV.Api.Infrastructure;
public sealed record ScheduleInput(int DiaSemana,TimeOnly Desde,TimeOnly Hasta);
public static class AgendaRules {
 public static readonly TimeZoneInfo Zone=TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");
 public static List<ScheduleInput> Defaults()=>Enumerable.Range(1,5).Select(d=>new ScheduleInput(d,new(8,0),new(17,0))).ToList();
 public static bool Valid(List<ScheduleInput> values)=>values.Count is >=1 and <=7&&values.All(x=>x!=null&&x.DiaSemana is >=0 and <=6&&x.Desde<x.Hasta)&&values.Select(x=>x.DiaSemana).Distinct().Count()==values.Count;
 public static bool Fits(DateTime inicio,DateTime fin,IEnumerable<ScheduleInput> schedules){var a=TimeZoneInfo.ConvertTimeFromUtc(Helpers.Utc(inicio),Zone);var b=TimeZoneInfo.ConvertTimeFromUtc(Helpers.Utc(fin),Zone);return a.Date==b.Date&&schedules.Any(s=>s.DiaSemana==(int)a.DayOfWeek&&TimeOnly.FromDateTime(a)>=s.Desde&&TimeOnly.FromDateTime(b)<=s.Hasta);}
 public static async Task<bool> Allowed(AppDbContext db,int doctorId,DateTime inicio,DateTime fin){var schedules=await db.HorariosMedico.AsNoTracking().Where(h=>h.MedicoId==doctorId&&h.Activo).Select(h=>new ScheduleInput(h.DiaSemana,h.Desde,h.Hasta)).ToListAsync();return schedules.Count==0||Fits(inicio,fin,schedules);}
}
