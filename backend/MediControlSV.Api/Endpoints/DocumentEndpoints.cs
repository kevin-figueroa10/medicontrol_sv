using System.Security.Claims;
using System.Data;
using MediControlSV.Api.Data;
using MediControlSV.Api.Models;
using MediControlSV.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
namespace MediControlSV.Api.Endpoints;
public static class DocumentEndpoints {
 static async Task<bool> Access(AppDbContext db,ClaimsPrincipal user,int patientId,bool photo=false)=>Helpers.Role(user) switch {
  "Administrador"=>await db.Pacientes.AnyAsync(p=>p.Id==patientId),
  "Recepcionista"=>photo&&await db.Pacientes.AnyAsync(p=>p.Id==patientId),
  "Paciente"=>await db.Pacientes.AnyAsync(p=>p.Id==patientId&&p.UsuarioId==Helpers.UserId(user)),
  "Medico"=>await db.Citas.AnyAsync(c=>c.PacienteId==patientId&&c.Medico!.UsuarioId==Helpers.UserId(user)),
  _=>false
 };
 static Task<EstudioMedico?> Study(AppDbContext db,int id)=>db.EstudiosMedicos.Include(x=>x.Consulta).ThenInclude(x=>x!.Cita).ThenInclude(x=>x!.Medico).Include(x=>x.Consulta).ThenInclude(x=>x!.Cita).ThenInclude(x=>x!.Paciente).FirstOrDefaultAsync(x=>x.Id==id);
 sealed record Upload(byte[] Bytes,string Mime,string Name);
 static async Task<Upload> ReadUpload(HttpRequest request,bool photo){
  if(!request.HasFormContentType)throw new InvalidDataException("Adjunte un archivo PDF, PNG o JPEG.");
  var form=await request.ReadFormAsync();if(form.Files.Count!=1)throw new InvalidDataException("Adjunte exactamente un archivo.");
  var file=form.Files[0];var limit=photo?2097152:5242880;
  if(file.Length<1||file.Length>limit)throw new InvalidDataException(photo?"La foto debe pesar como máximo 2 MB.":"El archivo debe pesar como máximo 5 MB.");
  if(!UploadRules.ValidName(file.FileName))throw new InvalidDataException("Nombre de archivo inválido; máximo 140 caracteres.");
  await using var input=file.OpenReadStream();using var output=new MemoryStream();await input.CopyToAsync(output);var bytes=output.ToArray();
  var mime=UploadRules.Mime(bytes);if(mime==null||(photo&&mime=="application/pdf"))throw new InvalidDataException(photo?"La foto debe ser PNG o JPEG.":"Formato no admitido. Use PDF, PNG o JPEG.");
  return new(bytes,mime,file.FileName);
 }
 static async Task Cleanup(PrivateFileStore store,string key,ILogger logger){try{await store.Delete(key);}catch(Exception ex){logger.LogWarning(ex,"No se pudo limpiar un archivo privado huérfano.");}}
 static async Task<IResult> Save(int patientId,int? studyId,bool photo,HttpRequest request,AppDbContext db,ClaimsPrincipal user,PrivateFileStore store,ILoggerFactory logs){
  Upload upload;try{upload=await ReadUpload(request,photo);}catch(InvalidDataException ex){return Helpers.Bad(ex.Message);}
  string key;try{key=await store.Save(upload.Bytes,upload.Mime);}catch(FileStorageException ex){return Results.Problem(ex.Message,statusCode:503);}
  var logger=logs.CreateLogger("PrivateDocuments");string? oldKey=null;
  try{
   await using var tx=await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
   if(studyId is int id){
    var study=await Study(db,id);if(study==null){await Cleanup(store,key,logger);return Results.NotFound();}
    await db.Entry(study).ReloadAsync();
    if(study.Estado=="Revisado"){await Cleanup(store,key,logger);return Helpers.Bad("El estudio ya fue revisado; no se pueden agregar resultados.");}
    if(await db.DocumentosPaciente.CountAsync(d=>d.EstudioMedicoId==id)>=10){await Cleanup(store,key,logger);return Helpers.Bad("Máximo 10 archivos por estudio.");}
    var result=await db.ResultadosEstudio.FirstOrDefaultAsync(r=>r.EstudioMedicoId==id);
    if(result?.Revisado==true){await Cleanup(store,key,logger);return Helpers.Bad("El resultado ya fue revisado.");}
    if(result==null)db.ResultadosEstudio.Add(new ResultadoEstudio{EstudioMedicoId=id,Descripcion="Resultado adjunto en archivo."});
    study.Estado="Resultado disponible";
   }
   var doc=photo?await db.DocumentosPaciente.FirstOrDefaultAsync(d=>d.PacienteId==patientId&&d.EsFoto):null;
   if(doc==null){doc=new DocumentoPaciente{PacienteId=patientId,EsFoto=photo,EstudioMedicoId=studyId};db.DocumentosPaciente.Add(doc);}else oldKey=doc.RutaPrivada;
   doc.Nombre=upload.Name;doc.TipoMime=upload.Mime;doc.RutaPrivada=key;doc.UsuarioCargaId=Helpers.UserId(user);doc.FechaUtc=DateTime.UtcNow;
   await db.SaveChangesAsync();PortalEndpoints.Audit(db,user,photo?"FOTO":"CARGAR",studyId.HasValue?"ResultadoEstudio":"Documento",doc.Id);await db.SaveChangesAsync();await tx.CommitAsync();
   if(oldKey!=null)await Cleanup(store,oldKey,logger);
   return Results.Ok(new{doc.Id});
  }catch{await Cleanup(store,key,logger);throw;}
 }
 public static void MapDocuments(this RouteGroupBuilder api){
  api.MapPost("/pacientes/{id:int}/documentos",async(int id,HttpRequest request,AppDbContext db,ClaimsPrincipal user,PrivateFileStore store,ILoggerFactory logs)=>{
   if(!await Access(db,user,id))return Results.Forbid();return await Save(id,null,false,request,db,user,store,logs);
  }).RequireAuthorization(p=>p.RequireRole("Administrador","Medico"));
  api.MapPost("/pacientes/{id:int}/foto",async(int id,HttpRequest request,AppDbContext db,ClaimsPrincipal user,PrivateFileStore store,ILoggerFactory logs)=>{
   if(!await Access(db,user,id,true))return Results.Forbid();return await Save(id,null,true,request,db,user,store,logs);
  }).RequireAuthorization(p=>p.RequireRole("Administrador","Recepcionista","Medico","Paciente"));
  api.MapPost("/estudios/{id:int}/archivos",async(int id,HttpRequest request,AppDbContext db,ClaimsPrincipal user,PrivateFileStore store,ILoggerFactory logs)=>{
   var study=await Study(db,id);if(study==null)return Results.NotFound();
   if(!UploadRules.CanUploadStudy(Helpers.Role(user),Helpers.UserId(user),study.Consulta!.Cita!.Medico!.UsuarioId))return Results.Forbid();
   if(study.Estado=="Revisado")return Helpers.Bad("El estudio ya fue revisado.");
   return await Save(study.Consulta.Cita.PacienteId,id,false,request,db,user,store,logs);
  }).RequireAuthorization(p=>p.RequireRole("Administrador","Laboratorio","Medico"));
  api.MapGet("/documentos/{id:int}",async(int id,AppDbContext db,ClaimsPrincipal user,PrivateFileStore store,HttpResponse response)=>{
   var doc=await db.DocumentosPaciente.AsNoTracking().FirstOrDefaultAsync(d=>d.Id==id);if(doc==null)return Results.NotFound();
   if(doc.EstudioMedicoId is int studyId){var study=await Study(db,studyId);if(study==null||!UploadRules.CanReadStudy(Helpers.Role(user),Helpers.UserId(user),study.Consulta!.Cita!.Medico!.UsuarioId,study.Consulta.Cita.Paciente!.UsuarioId))return Results.Forbid();}
   else if(!await Access(db,user,doc.PacienteId,doc.EsFoto))return Results.Forbid();
   byte[]? bytes;try{bytes=await store.Read(doc.RutaPrivada);}catch(FileStorageException ex){return Results.Problem(ex.Message,statusCode:503);}
   if(bytes==null)return Results.NotFound();response.Headers.CacheControl="private, no-store";response.Headers["X-Content-Type-Options"]="nosniff";
   return doc.EsFoto?Results.File(bytes,doc.TipoMime):Results.File(bytes,doc.TipoMime,doc.Nombre);
  });
 }
}
