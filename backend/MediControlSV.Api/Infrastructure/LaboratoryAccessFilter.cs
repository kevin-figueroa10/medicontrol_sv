namespace MediControlSV.Api.Infrastructure;
public sealed class LaboratoryAccessFilter:IEndpointFilter {
 public ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context,EndpointFilterDelegate next){
  var http=context.HttpContext;if(Helpers.Role(http.User)!="Laboratorio")return next(context);
  var path=http.Request.Path.Value??"";var method=http.Request.Method;
  var allowed=method=="GET"&&(path=="/api/panel"||path=="/api/notificaciones"||System.Text.RegularExpressions.Regex.IsMatch(path,@"^/api/documentos/\d+$"))
   ||method=="PATCH"&&path=="/api/notificaciones/leidas"
   ||method=="POST"&&(path=="/api/auth/password"||System.Text.RegularExpressions.Regex.IsMatch(path,@"^/api/estudios/\d+/(archivos|resultado)$"));
  return allowed?next(context):ValueTask.FromResult<object?>(Results.Forbid());
 }
}
