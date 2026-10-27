$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$testName='MediControlSV_Test_'+[DateTime]::UtcNow.ToString('yyyyMMddHHmmss')
$env:ASPNETCORE_ENVIRONMENT='Development'
$env:Jwt__Key=[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:ConnectionStrings__Default="Server=localhost;Database=$testName;Trusted_Connection=True;TrustServerCertificate=True;"
$env:Database__InitializeDevelopment='true'
$env:MC_TEST_EMAIL='admin@test.local'
$env:MC_TEST_PASSWORD='Test!9'+[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(12)).ToLowerInvariant()
$env:Seed__AdminEmail=$env:MC_TEST_EMAIL
$env:Seed__AdminPassword=$env:MC_TEST_PASSWORD
$env:Logging__LogLevel__Default='Warning'
$env:Documents__Root="$root/.checks/test-documents-$testName"
$process=$null
try{
 $process=Start-Process dotnet -ArgumentList @('.checks/backend-final/MediControlSV.Api.dll','--contentRoot',"`"$root/backend/MediControlSV.Api`"",'--urls','http://localhost:5091') -WorkingDirectory $root -WindowStyle Hidden -PassThru -RedirectStandardOutput "$root/.checks/integracion-api.log" -RedirectStandardError "$root/.checks/integracion-api.err"
 $ready=$false
 for($i=0;$i-lt30;$i++){if($process.HasExited){throw 'El servidor de prueba no inició. Consulte .checks/integracion-api.err.'};try{$response=Invoke-WebRequest 'http://localhost:5091/api/health' -NoProxy -TimeoutSec 2;if($response.StatusCode-eq200){$ready=$true;break}}catch{};Start-Sleep -Milliseconds 500}
 if(!$ready){throw 'No respondió el servidor de pruebas.'}
 & "$PSScriptRoot/integracion.ps1"
}finally{
 if($process-and!$process.HasExited){Stop-Process -Id $process.Id}
 if(Test-Path -LiteralPath "$root/.checks/test-documents-$testName"){
  $folder=[IO.Path]::GetFullPath("$root/.checks/test-documents-$testName")
  $allowed=[IO.Path]::GetFullPath("$root/.checks")+[IO.Path]::DirectorySeparatorChar
  if(!$folder.StartsWith($allowed,[StringComparison]::OrdinalIgnoreCase)){throw 'Ruta de archivos de prueba fuera del proyecto.'}
  Remove-Item -LiteralPath $folder -Recurse -Force
 }
 if($testName-notmatch'^MediControlSV_Test_\d{14}$'){throw 'Nombre de base de pruebas inválido; no se elimina.'}
 & sqlcmd -S localhost -E -C -b -Q "IF DB_ID('$testName') IS NOT NULL BEGIN ALTER DATABASE [$testName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$testName]; END"
}

