$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$runtime=Join-Path $root '.runtime'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
function Responds([string]$Url){try{return (Invoke-WebRequest $Url -NoProxy -TimeoutSec 3).StatusCode-eq200}catch{return $false}}
if(!(Responds 'http://localhost:5080/api/health')){
 $env:ASPNETCORE_ENVIRONMENT='Development'
 if(!$env:Jwt__Key){$env:Jwt__Key=[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))}
 Start-Process dotnet -ArgumentList @('run','--project',"`"$root/backend/MediControlSV.Api`"",'--urls','http://localhost:5080') -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput "$runtime/api.log" -RedirectStandardError "$runtime/api.err" | Out-Null
}
if(!(Responds 'http://127.0.0.1:5173')){
 Start-Process $env:ComSpec -ArgumentList @('/d','/c','npm run dev -- --port 5173 --host 127.0.0.1') -WorkingDirectory "$root/frontend" -WindowStyle Hidden -RedirectStandardOutput "$runtime/frontend.log" -RedirectStandardError "$runtime/frontend.err" | Out-Null
}
for($i=0;$i-lt30;$i++){if((Responds 'http://localhost:5080/api/health')-and(Responds 'http://127.0.0.1:5173')){Write-Output 'App lista: http://127.0.0.1:5173';exit 0};Start-Sleep -Milliseconds 500}
throw 'No se pudo iniciar la app. Revise los archivos de diagnóstico en .runtime y la conexión a SQL Server.'
