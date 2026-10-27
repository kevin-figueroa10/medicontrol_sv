param([Parameter(Mandatory=$true)][string]$Password)
$ErrorActionPreference='Stop'
$h=[System.Net.Http.HttpClientHandler]::new();$h.UseProxy=$false
$client=[System.Net.Http.HttpClient]::new($h);$client.Timeout=[TimeSpan]::FromSeconds(15)
try{
 foreach($email in @('medico2@prueba.invalid','recepcion@prueba.invalid','paciente1@prueba.invalid')){
  $content=[System.Net.Http.StringContent]::new((@{correo=$email;password=$Password}|ConvertTo-Json -Compress),[Text.Encoding]::UTF8,'application/json')
  $login=$client.PostAsync('http://localhost:5080/api/auth/login',$content).GetAwaiter().GetResult();$login.EnsureSuccessStatusCode()|Out-Null
  $session=$login.Content.ReadAsStringAsync().GetAwaiter().GetResult()|ConvertFrom-Json
  $request=[System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Get,'http://localhost:5080/api/panel');$request.Headers.Authorization=[System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer',$session.token)
  $response=$client.SendAsync($request).GetAwaiter().GetResult();$response.EnsureSuccessStatusCode()|Out-Null
  $panel=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult()|ConvertFrom-Json
  if($session.rol-eq'Paciente'-and($panel.patients.Count-ne1-or$panel.users.Count-ne0)){throw 'El portal del paciente no se filtró correctamente.'}
  if($session.rol-eq'Recepcionista'-and$panel.consultations.Count-ne0){throw 'Recepción no debe ver consultas clínicas.'}
  Write-Output "$($session.rol): acceso correcto; pacientes visibles=$($panel.patients.Count), citas=$($panel.appointments.Count), consultas=$($panel.consultations.Count)."
 }
}finally{$client.Dispose()}
