namespace MediControlSV.Api.Infrastructure;
public static class UploadRules {
 public static string? Mime(byte[] bytes)=>bytes.Length>=5&&bytes.AsSpan(0,5).SequenceEqual("%PDF-"u8)?"application/pdf":bytes.Length>=8&&bytes.AsSpan(0,8).SequenceEqual(new byte[]{137,80,78,71,13,10,26,10})?"image/png":bytes.Length>=3&&bytes[0]==255&&bytes[1]==216&&bytes[2]==255?"image/jpeg":null;
 public static bool ValidName(string name)=>!string.IsNullOrWhiteSpace(name)&&name.Length<=140&&!name.Any(char.IsControl)&&!name.Contains('/')&&!name.Contains('\\');
 public static bool CanReadStudy(string? role,int? actorId,int? doctorUserId,int? patientUserId)=>actorId>0&&(role is "Administrador" or "Laboratorio"||(role=="Medico"&&actorId==doctorUserId)||(role=="Paciente"&&actorId==patientUserId));
 public static bool CanUploadStudy(string? role,int? actorId,int? doctorUserId)=>actorId>0&&(role is "Administrador" or "Laboratorio"||(role=="Medico"&&actorId==doctorUserId));
}
