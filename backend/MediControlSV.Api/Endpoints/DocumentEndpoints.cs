using System.Security.Claims;
using MediControlSV.Api.Data;
using MediControlSV.Api.Models;
using MediControlSV.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
namespace MediControlSV.Api.Endpoints;
public static class DocumentEndpoints {
 static async Task<bool> Access(AppDbContext db,ClaimsPrincipal u,int patientId)=>Helpers.Role(u) switch {
  "Administrador"=>await db.Pacientes.AnyAsync(p=>p.Id==patientId),
  "Paciente"=>await db.Pacientes.AnyAsync(p=>p.Id==patientId&&p.UsuarioId==Helpers.UserId(u)),
  "Medico"=>await db.Citas.AnyAsync(c=>c.PacienteId==patientId&&c.Medico!.UsuarioId==Helpers.UserId(u)),
  _=>false
 };
 public static void MapDocuments(this RouteGroupBuilder api){
  api.MapPost("/pacientes/{id:int}/documentos",async(int id,HttpRequest request,AppDbContext db,ClaimsPrincipal user,IWebHostEnvironment env,IConfiguration config)=>{
   if(!await Access(db,user,id))return Results.Forbid();if(!request.HasFormContentType)return Helpers.Bad("Adjunte un PDF, PNG o JPEG.");var form=await request.ReadFormAsync();if(form.Files.Count!=1)return Helpers.Bad("Adjunte un archivo a la vez.");var file=form.Files[0];if(file.Length is <1 or >5242880)return Helpers.Bad("El archivo debe pesar entre 1 byte y 5 MB.");
   await using var input=file.OpenReadStream();var signature=new byte[8];var read=await input.ReadAsync(signature);var mime=read>=5&&signature.AsSpan(0,5).SequenceEqual("%PDF-"u8)?"application/pdf":read>=8&&signature.AsSpan(0,8).SequenceEqual(new byte[]{137,80,78,71,13,10,26,10})?"image/png":read>=3&&signature[0]==255&&signature[1]==216&&signature[2]==255?"image/jpeg":null;if(mime==null)return Helpers.Bad("Formato no admitido. Use PDF, PNG o JPEG.");
   var name=Path.GetFileName(file.FileName);if(string.IsNullOrWhiteSpace(name)||name.Length>140)return Helpers.Bad("Nombre de archivo inválido (máximo 140).");var directory=Path.GetFullPath(config["Documents:Root"]??Path.Combine(env.ContentRootPath,"App_Data","Documentos"));Directory.CreateDirectory(directory);var key=Guid.NewGuid().ToString("N");var path=Path.Combine(directory,key);
   try{await using(var output=File.Create(path)){await output.WriteAsync(signature.AsMemory(0,read));await input.CopyToAsync(output);}var doc=new DocumentoPaciente{PacienteId=id,Nombre=name,TipoMime=mime,RutaPrivada=key,UsuarioCargaId=Helpers.UserId(user)};db.DocumentosPaciente.Add(doc);await db.SaveChangesAsync();PortalEndpoints.Audit(db,user,"CARGAR","Documento",doc.Id);await db.SaveChangesAsync();return Results.Ok(new{doc.Id});}catch{if(File.Exists(path))File.Delete(path);throw;}
  }).RequireAuthorization(p=>p.RequireRole("Administrador","Medico"));
  api.MapGet("/documentos/{id:int}",async(int id,AppDbContext db,ClaimsPrincipal user,IWebHostEnvironment env,IConfiguration config)=>{var doc=await db.DocumentosPaciente.AsNoTracking().FirstOrDefaultAsync(d=>d.Id==id);if(doc==null)return Results.NotFound();if(!await Access(db,user,doc.PacienteId))return Results.Forbid();var path=Path.Combine(Path.GetFullPath(config["Documents:Root"]??Path.Combine(env.ContentRootPath,"App_Data","Documentos")),Path.GetFileName(doc.RutaPrivada));if(!File.Exists(path))return Results.NotFound();return Results.File(path,doc.TipoMime,doc.Nombre);});
 }
}
