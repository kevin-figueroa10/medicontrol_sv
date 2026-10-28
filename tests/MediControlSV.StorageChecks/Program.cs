using System.Net;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using MediControlSV.Api.Infrastructure;

var checks=0;
void Check(bool condition,string label){if(!condition)throw new Exception(label);checks++;}
async Task Reject(Func<Task> action,string label){try{await action();}catch(FileStorageException){checks++;return;}throw new Exception(label);}
var bytes=Encoding.ASCII.GetBytes("%PDF-1.7 test-only");
Check(UploadRules.Mime(bytes)=="application/pdf","PDF signature");
Check(UploadRules.Mime([137,80,78,71,13,10,26,10])=="image/png","PNG signature");
Check(UploadRules.Mime([255,216,255,0])=="image/jpeg","JPEG signature");
Check(UploadRules.Mime(Encoding.ASCII.GetBytes("<script>"))==null,"Reject executable content");
Check(!UploadRules.ValidName("../report.pdf"),"Reject path traversal");
Check(!UploadRules.ValidName("report\r\n.pdf"),"Reject header control characters");
Check(UploadRules.CanReadStudy("Paciente",3,2,3),"Patient reads own study");
Check(!UploadRules.CanReadStudy("Paciente",4,2,3),"Patient cannot read another study");
Check(!UploadRules.CanReadStudy("Recepcionista",4,2,3),"Reception cannot read studies");
Check(!UploadRules.CanUploadStudy("Medico",4,2),"Other doctor cannot upload");
Check(UploadRules.CanUploadStudy("Laboratorio",4,2),"Laboratory uploads results");
Check(!UploadRules.CanUploadStudy("Paciente",3,2),"Patient cannot upload results");
var handler=new StorageHandler(bytes);
var config=new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?>{{"Supabase:Url","https://test-project.supabase.co"},{"Supabase:ServiceRoleKey","test-server-key"},{"Supabase:Bucket","medicontrol-archivos"}}).Build();
var store=new PrivateFileStore(new HttpClient(handler),config,new TestEnvironment());
var key=await store.Save(bytes,"application/pdf");Check(key.StartsWith("sb:"),"Persist cloud reference");
Check((await store.Read(key))!.SequenceEqual(bytes),"Authenticated private download");
await store.Delete(key);Check(handler.Calls==4,"Private bucket check, upload, download and delete");
handler.Public=true;await Reject(()=>store.Save(bytes,"application/pdf"),"Reject public bucket");
await Reject(()=>store.Read("sb:../../escape"),"Reject unsafe object keys");
var missing=new PrivateFileStore(new HttpClient(handler),new ConfigurationBuilder().Build(),new TestEnvironment());
await Reject(()=>missing.Save(bytes,"application/pdf"),"No disk fallback in production");
var filter=new LaboratoryAccessFilter();
foreach(var path in new[]{"/api/pacientes/1","/api/citas/","/api/consultas/1","/api/pagos","/api/usuarios","/api/auditoria"}){
 var http=new DefaultHttpContext();http.User=new ClaimsPrincipal(new ClaimsIdentity(new[]{new Claim(ClaimTypes.Role,"Laboratorio")},"test"));http.Request.Path=path;http.Request.Method="GET";
 var context=EndpointFilterInvocationContext.Create(http);
 var called=false;await filter.InvokeAsync(context,_=>{called=true;return ValueTask.FromResult<object?>(null);});Check(!called,$"Laboratory blocked: {path}");
}
foreach(var (method,path) in new[]{("GET","/api/panel"),("GET","/api/documentos/1"),("POST","/api/estudios/1/archivos"),("POST","/api/estudios/1/resultado")}){
 var http=new DefaultHttpContext();http.User=new ClaimsPrincipal(new ClaimsIdentity(new[]{new Claim(ClaimTypes.Role,"Laboratorio")},"test"));http.Request.Path=path;http.Request.Method=method;
 var called=false;await filter.InvokeAsync(EndpointFilterInvocationContext.Create(http),_=>{called=true;return ValueTask.FromResult<object?>(null);});Check(called,$"Laboratory allowed: {path}");
}
foreach(var (method,path) in new[]{("PATCH","/api/estudios/1/revisar"),("PUT","/api/estudios/1/interpretacion"),("POST","/api/pacientes/1/foto")}){
 var http=new DefaultHttpContext();http.User=new ClaimsPrincipal(new ClaimsIdentity(new[]{new Claim(ClaimTypes.Role,"Laboratorio")},"test"));http.Request.Path=path;http.Request.Method=method;
 var called=false;await filter.InvokeAsync(EndpointFilterInvocationContext.Create(http),_=>{called=true;return ValueTask.FromResult<object?>(null);});Check(!called,$"Laboratory cannot change medical review or photo: {path}");
}
Console.WriteLine($"OK: {checks} comprobaciones de archivos, bucket privado y permisos. Sin llamadas reales a Supabase ni a SQL.");

sealed class StorageHandler(byte[] bytes):HttpMessageHandler {
 public int Calls;public bool Public;
 protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct){
  Calls++;
  if(request.Headers.Authorization?.Parameter!="test-server-key"||!request.Headers.Contains("apikey"))throw new Exception("Missing server authentication");
  var response=new HttpResponseMessage(HttpStatusCode.OK);
  response.Content=request.RequestUri!.AbsolutePath.Contains("/bucket/")?new StringContent(Public?"{\"public\":true}":"{\"public\":false}"):new ByteArrayContent(bytes);
  return Task.FromResult(response);
 }
}
sealed class TestEnvironment:IWebHostEnvironment {
 public string EnvironmentName{get;set;}="Production";public string ApplicationName{get;set;}="Tests";public string ContentRootPath{get;set;}=Directory.GetCurrentDirectory();public IFileProvider ContentRootFileProvider{get;set;}=new NullFileProvider();public string WebRootPath{get;set;}="";public IFileProvider WebRootFileProvider{get;set;}=new NullFileProvider();
}
