using System.Net;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System.Net.Http.Json;
using System.Text.Json;

namespace MediControlSV.Api.Infrastructure;

public sealed class FileStorageException(string message):Exception(message);

public sealed class PrivateFileStore(HttpClient client,IConfiguration config,IWebHostEnvironment env){
 string Root=>Path.GetFullPath(config["Documents:Root"]??Path.Combine(env.ContentRootPath,"App_Data","Documentos"));
 bool Cloud=>!string.IsNullOrWhiteSpace(config["Supabase:Url"])||!string.IsNullOrWhiteSpace(config["Supabase:ServiceRoleKey"]);
 HttpRequestMessage Request(HttpMethod method,string path){
  var url=config["Supabase:Url"]?.TrimEnd('/');var secret=config["Supabase:ServiceRoleKey"];var bucket=config["Supabase:Bucket"]??"medicontrol-archivos";
  if(!Uri.TryCreate(url,UriKind.Absolute,out var uri)||uri.Scheme!="https"||string.IsNullOrWhiteSpace(secret)||!System.Text.RegularExpressions.Regex.IsMatch(bucket,"^[a-z0-9][a-z0-9._-]{1,62}$"))
   throw new FileStorageException("Configure el almacenamiento privado de Supabase en Render.");
  var request=new HttpRequestMessage(method,$"{url}/storage/v1/{path.Replace("{bucket}",Uri.EscapeDataString(bucket))}");
  request.Headers.Authorization=new AuthenticationHeaderValue("Bearer",secret);request.Headers.Add("apikey",secret);return request;
 }
 static string ObjectKey(string key){if(!key.StartsWith("sb:")||!Guid.TryParseExact(key[3..],"N",out _))throw new FileStorageException("Referencia de archivo inválida.");return key[3..];}
 async Task EnsurePrivate(CancellationToken cancellationToken){
  using var request=Request(HttpMethod.Get,"bucket/{bucket}");
  try{using var response=await client.SendAsync(request,cancellationToken);if(!response.IsSuccessStatusCode)throw new FileStorageException("No se encontró el bucket privado. Revise su nombre y la clave del servidor.");
   using var metadata=JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
   if(!metadata.RootElement.TryGetProperty("public",out var value)||value.ValueKind!=JsonValueKind.False)throw new FileStorageException("El bucket debe ser privado. Desactive Public en Supabase antes de cargar datos.");
  }catch(HttpRequestException){throw new FileStorageException("No se pudo conectar con Supabase.");}catch(OperationCanceledException){throw new FileStorageException("Supabase tardó demasiado en responder. Intente nuevamente.");}
 }
 public async Task<string> Save(byte[] bytes,string mime,CancellationToken cancellationToken=default){
  var key=Guid.NewGuid().ToString("N");
  if(!Cloud){if(!env.IsDevelopment())throw new FileStorageException("Configure Supabase antes de cargar archivos en producción.");Directory.CreateDirectory(Root);await File.WriteAllBytesAsync(Path.Combine(Root,key),bytes,cancellationToken);return key;}
  await EnsurePrivate(cancellationToken);
  using var request=Request(HttpMethod.Post,$"object/{{bucket}}/{key}");request.Content=new ByteArrayContent(bytes);request.Content.Headers.ContentType=new MediaTypeHeaderValue(mime);request.Headers.Add("x-upsert","false");
  try{using var response=await client.SendAsync(request,cancellationToken);if(!response.IsSuccessStatusCode)throw new FileStorageException("No se pudo guardar el archivo. Compruebe el bucket privado y la configuración de Supabase.");}
  catch(HttpRequestException){throw new FileStorageException("No se pudo conectar con el almacenamiento privado.");}
  catch(OperationCanceledException){throw new FileStorageException("El almacenamiento tardó demasiado en responder. Intente nuevamente.");}
  return "sb:"+key;
 }
 public async Task<byte[]?> Read(string key,CancellationToken cancellationToken=default){
  if(!key.StartsWith("sb:")){if(!Guid.TryParseExact(key,"N",out _))return null;var path=Path.Combine(Root,key);return File.Exists(path)?await File.ReadAllBytesAsync(path,cancellationToken):null;}
  using var request=Request(HttpMethod.Get,$"object/authenticated/{{bucket}}/{ObjectKey(key)}");
  try{using var response=await client.SendAsync(request,cancellationToken);if(response.StatusCode==HttpStatusCode.NotFound)return null;if(!response.IsSuccessStatusCode)throw new FileStorageException("No se pudo descargar el archivo privado.");return await response.Content.ReadAsByteArrayAsync(cancellationToken);}
  catch(HttpRequestException){throw new FileStorageException("No se pudo conectar con el almacenamiento privado.");}
  catch(OperationCanceledException){throw new FileStorageException("El almacenamiento tardó demasiado en responder. Intente nuevamente.");}
 }
 public async Task Delete(string key){
  if(!key.StartsWith("sb:")){if(Guid.TryParseExact(key,"N",out _)){var path=Path.Combine(Root,key);if(File.Exists(path))File.Delete(path);}return;}
  using var request=Request(HttpMethod.Delete,"object/{bucket}");request.Content=JsonContent.Create(new{prefixes=new[]{ObjectKey(key)}});
  using var response=await client.SendAsync(request);if(!response.IsSuccessStatusCode&&response.StatusCode!=HttpStatusCode.NotFound)throw new FileStorageException("No se pudo eliminar el archivo privado.");
 }
}
