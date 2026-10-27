using System.Reflection;
namespace MediControlSV.Api.Infrastructure;

// Minimal API records do not automatically enforce non-nullable JSON properties.
public sealed class InputValidationFilter : IEndpointFilter {
 public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next) {
  foreach(var argument in context.Arguments) {
   if(argument is null || argument.GetType().Namespace!="MediControlSV.Api.Endpoints")continue;
   var errors=new Dictionary<string,string[]>();
   Validate(argument,"",errors);
   if(errors.Count>0)return Results.ValidationProblem(errors);
  }
  return await next(context);
 }
 static void Validate(object value,string prefix,Dictionary<string,string[]> errors) {
  var results=new List<System.ComponentModel.DataAnnotations.ValidationResult>();
  System.ComponentModel.DataAnnotations.Validator.TryValidateObject(value,new(value),results,true);
  foreach(var result in results)foreach(var field in result.MemberNames)errors[prefix+field]=[result.ErrorMessage??"Valor inválido."];
  var nullability=new NullabilityInfoContext();
  foreach(var property in value.GetType().GetProperties()) {
   var item=property.GetValue(value);var key=prefix+property.Name;
   if(item is null && nullability.Create(property).ReadState==NullabilityState.NotNull)
    errors[key]=["El campo es obligatorio."];
   if(item is string text && text.Length>2500)errors[key]=["El campo supera la longitud permitida."];
   if(item is not null && property.PropertyType.Namespace=="MediControlSV.Api.Contracts")Validate(item,key+".",errors);
   if(item is System.Collections.IList list) {
    if(list.Count>20){errors[key]=["Demasiados elementos."];continue;}
    for(var i=0;i<list.Count;i++)if(list[i] is {} child)Validate(child,key+$"[{i}].",errors);else errors[key]=["No se permiten elementos nulos."];
   }
  }
 }
}
