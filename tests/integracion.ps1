param([string]$BaseUrl='http://localhost:5091')
$ErrorActionPreference='Stop'
$handler=[System.Net.Http.HttpClientHandler]::new()
$handler.UseProxy=$false
$client=[System.Net.Http.HttpClient]::new($handler)
$client.Timeout=[TimeSpan]::FromSeconds(20)
$script:checks=0
function Request([string]$Method,[string]$Path,$Body=$null,[string]$Token='',[int]$Expected=200){
 $request=[System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::new($Method),"$BaseUrl/api$Path")
 if($Token){$request.Headers.Authorization=[System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer',$Token)}
 if($null-ne$Body){$request.Content=[System.Net.Http.StringContent]::new(($Body|ConvertTo-Json -Depth 15 -Compress),[Text.Encoding]::UTF8,'application/json')}
 $response=$client.SendAsync($request).GetAwaiter().GetResult()
 $text=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
 if([int]$response.StatusCode-ne$Expected){throw "$Method $Path esperado $Expected, recibido $([int]$response.StatusCode): $text"}
 $script:checks++
 if($text){return ($text|ConvertFrom-Json)}
}
function Check($Condition,[string]$Label){if(!$Condition){throw "Validación fallida: $Label"};$script:checks++}
function Login([string]$Mail){return (Request POST '/auth/login' @{correo=$Mail;password=$env:MC_TEST_PASSWORD}).token}
$admin=Login $env:MC_TEST_EMAIL
Request GET '/panel' $null '' 401 | Out-Null
Request POST '/pacientes/detalle' @{nombre='X';documento='1';fechaNacimiento='2099-01-01'} $admin 400 | Out-Null
$p=@{nombre='Paciente de prueba automatizada';documento='TEST-100001';fechaNacimiento='1990-04-10';telefono='7000-0000';correo='patient@test.local';sexo='Femenino';direccion='Dirección de prueba';notas='Solo datos de prueba';contactoNombre='Contacto de prueba';contactoTelefono='7000-0001';parentesco='Familiar'}
$patient=(Request POST '/pacientes/detalle' $p $admin).id
Request POST '/pacientes/detalle' $p $admin 409 | Out-Null
$p.nombre='Paciente actualizado';Request PUT "/pacientes/$patient/detalle" $p $admin | Out-Null
$doctorUser=(Request POST '/usuarios' @{nombre='Médico de prueba';correo='doctor@test.local';password=$env:MC_TEST_PASSWORD;rol='Medico'} $admin 201).id
$otherDoctorUser=(Request POST '/usuarios' @{nombre='Médico ajeno';correo='otherdoctor@test.local';password=$env:MC_TEST_PASSWORD;rol='Medico'} $admin 201).id
$patientUser=(Request POST '/usuarios' @{nombre='Paciente prueba';correo='patient@test.local';password=$env:MC_TEST_PASSWORD;rol='Paciente'} $admin 201).id
$otherPatientUser=(Request POST '/usuarios' @{nombre='Paciente ajeno';correo='other@test.local';password=$env:MC_TEST_PASSWORD;rol='Paciente'} $admin 201).id
Request POST "/pacientes/$patient/vincular/$patientUser" $null $admin 204 | Out-Null
$receptionUser=(Request POST '/usuarios' @{nombre='Recepción prueba';correo='reception@test.local';password=$env:MC_TEST_PASSWORD;rol='Recepcionista'} $admin 201).id
Request POST '/usuarios' @{nombre='Inseguro';correo='bad@test.local';password='123';rol='Administrador'} $admin 400 | Out-Null
$doctor=(Request POST '/medicos' @{nombre='Médico de prueba';especialidad='Medicina de prueba';jvpm='TEST-JVPM-1';usuarioId=$doctorUser;telefono='7000-0020';horario='Lunes a viernes'} $admin 201).id
$specialty=(Request POST '/especialidades' @{nombre='Medicina de prueba';descripcion='Especialidad de prueba'} $admin 201).id
Request PUT "/especialidades/$specialty" @{nombre='Especialidad actualizada';descripcion='Descripción actualizada'} $admin 204 | Out-Null
$service=(Request POST '/servicios/detalle' @{nombre='Consulta de prueba';descripcion='Servicio de prueba';precio=40;duracionMinutos=30} $admin).id
Request PUT "/servicios/$service/detalle" @{nombre='Consulta de prueba';descripcion='Actualizada';precio=50;duracionMinutos=30} $admin | Out-Null
Request POST '/servicios/detalle' @{nombre='Precio inválido';precio=1.234;duracionMinutos=30} $admin 400 | Out-Null
$dr=Login 'doctor@test.local';$pat=Login 'patient@test.local';$other=Login 'other@test.local';$rec=Login 'reception@test.local';$otherDr=Login 'otherdoctor@test.local'
$start=[DateTime]::UtcNow.Date.AddDays(3).AddHours(15)
while($start.DayOfWeek-in@('Saturday','Sunday')){$start=$start.AddDays(1)}
$rescheduledStart=$start.AddDays(1)
while($rescheduledStart.DayOfWeek-in@('Saturday','Sunday')){$rescheduledStart=$rescheduledStart.AddDays(1)}
$appointment=@{pacienteId=$patient;medicoId=$doctor;servicioId=$service;inicio=$start.ToString('o');fin=$start.AddMinutes(30).ToString('o');motivo='Consulta de prueba'}
$outside=$appointment.Clone();$outside.inicio=$start.AddHours(-9).ToString('o');$outside.fin=$start.AddHours(-9).AddMinutes(30).ToString('o')
Request POST '/citas' $outside $rec 400 | Out-Null
$cita=(Request POST '/citas' $appointment $rec 201).id
Request POST '/citas' $appointment $admin 409 | Out-Null
Request POST '/citas' $appointment $other 403 | Out-Null
Request PATCH "/citas/$cita/estado?estado=Finalizada" $null $dr 409 | Out-Null
Request PUT "/citas/$cita/horario" @{inicio=$rescheduledStart.ToString('o');fin=$rescheduledStart.AddMinutes(30).ToString('o');motivo='Cambio de prueba'} $pat 204 | Out-Null
$availability=Request GET "/medicos/$doctor/disponibilidad?fecha=$($rescheduledStart.ToString('yyyy-MM-dd'))" $null $pat
Check ($availability.ocupados.Count-eq1) 'Disponibilidad real refleja reprogramación'
Request PATCH "/citas/$cita/estado?estado=En%20espera" $null $rec 204 | Out-Null
Request PATCH "/citas/$cita/estado?estado=En%20consulta" $null $otherDr 403 | Out-Null
Request PATCH "/citas/$cita/estado?estado=En%20consulta" $null $dr 204 | Out-Null
Request PATCH "/citas/$cita/estado?estado=Finalizada" $null $dr 409 | Out-Null
Request POST '/consultas' @{citaId=$cita;motivo='Motivo';diagnostico='Diagnóstico de prueba';signos=@{consultaId=0;temperatura=90}} $dr 400 | Out-Null
$consult=(Request POST '/consultas' @{citaId=$cita;motivo='Motivo';diagnostico='Diagnóstico de prueba';antecedentes='Antecedentes';evaluacion='Evaluación';tratamiento='Tratamiento';recomendaciones='Recomendaciones';observaciones='Observaciones';signos=@{consultaId=0;temperatura=36.5;presionSistolica=120;presionDiastolica=80;frecuenciaCardiaca=70;saturacion=98;pesoKg=60;alturaCm=165}} $dr 201).id
Request POST '/consultas' @{citaId=$cita;motivo='Motivo';diagnostico='Duplicada'} $dr 409 | Out-Null
Request POST '/recetas' @{consultaId=$consult;medicamentos=@($null)} $dr 400 | Out-Null
Request POST '/recetas' @{consultaId=$consult;medicamentos=@(@{medicamento='Medicamento de prueba';dosis='Dosis de prueba';frecuencia='Según prueba';duracion='1 día';presentacion='Prueba';indicaciones='No usar clínicamente'})} $dr 201 | Out-Null
$study=(Request POST '/estudios' @{consultaId=$consult;tipo='Estudio de prueba';indicaciones='Prueba'} $dr 201).id
Request POST "/estudios/$study/resultado" @{descripcion='Resultado automatizado de prueba'} $dr 204 | Out-Null
Request PATCH "/estudios/$study/revisar" $null $dr 204 | Out-Null
$follow=(Request POST '/seguimientos' @{consultaId=$consult;fecha=$start.AddDays(14).ToString('yyyy-MM-dd');motivo='Seguimiento de prueba';indicaciones='Prueba'} $dr 201).id
Request PATCH "/seguimientos/$follow/estado" @{estado='Completado'} $dr 204 | Out-Null
Request POST '/pagos' @{citaId=$cita;monto=1.001;metodo='Efectivo'} $rec 400 | Out-Null
Request POST '/pagos' @{citaId=$cita;monto=10;metodo='Tarjeta';referencia=''} $rec 400 | Out-Null
Request POST '/pagos' @{citaId=$cita;monto=51;metodo='Efectivo'} $rec 409 | Out-Null
Request POST '/pagos' @{citaId=$cita;monto=20;metodo='Efectivo'} $rec 201 | Out-Null
Request POST '/pagos' @{citaId=$cita;monto=30;metodo='Transferencia';referencia='TEST-001'} $rec 201 | Out-Null
Request POST '/pagos' @{citaId=$cita;monto=1;metodo='Efectivo'} $rec 409 | Out-Null
# Editing a service cannot alter the bill agreed when booking.
Request PUT "/servicios/$service/detalle" @{nombre='Consulta de prueba';descripcion='Precio nuevo';precio=100;duracionMinutos=30} $admin | Out-Null
Request POST '/pagos' @{citaId=$cita;monto=1;metodo='Efectivo'} $rec 409 | Out-Null
# Private document upload: reject unexpected content; accept a small test PDF.
function Upload([byte[]]$Bytes,[string]$Name,[string]$Token,[int]$Expected){
 $multipart=[System.Net.Http.MultipartFormDataContent]::new();$part=[System.Net.Http.ByteArrayContent]::new($Bytes);$multipart.Add($part,'archivo',$Name)
 $request=[System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Post,"$BaseUrl/api/pacientes/$patient/documentos");$request.Headers.Authorization=[System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer',$Token);$request.Content=$multipart
 $response=$client.SendAsync($request).GetAwaiter().GetResult();$text=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult();if([int]$response.StatusCode-ne$Expected){throw "Archivo: esperado $Expected, recibido $([int]$response.StatusCode): $text"};$script:checks++;if($text){return $text|ConvertFrom-Json}
}
Upload ([Text.Encoding]::UTF8.GetBytes('<script>prueba</script>')) 'invalido.pdf' $dr 400 | Out-Null
$doc=(Upload ([Text.Encoding]::ASCII.GetBytes("%PDF-1.4`n% Archivo de prueba automatizada`n%%EOF")) 'prueba.pdf' $dr 200).id
Request GET "/documentos/$doc" $null $other 403 | Out-Null
Request GET "/documentos/$doc" $null $otherDr 403 | Out-Null
Request GET "/documentos/$doc" $null $rec 403 | Out-Null
$request=[System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Get,"$BaseUrl/api/documentos/$doc");$request.Headers.Authorization=[System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer',$pat);$response=$client.SendAsync($request).GetAwaiter().GetResult();Check ($response.IsSuccessStatusCode-and$response.Content.Headers.ContentType.MediaType-eq'application/pdf') 'Paciente descarga su PDF privado'
Request PATCH "/citas/$cita/estado?estado=Finalizada" $null $dr 204 | Out-Null
Request PATCH "/citas/$cita/estado?estado=En%20espera" $null $rec 409 | Out-Null
$panel=Request GET '/panel' $null $pat
Check ($panel.patients.Count-eq1-and$panel.patients[0].nombre-eq'Paciente actualizado') 'Paciente ve su expediente actualizado'
Check ($panel.consultations.Count-eq1-and$panel.consultations[0].signos.temperatura-eq36.5) 'Signos vitales persistidos'
Check ($panel.prescriptions.Count-eq1-and$panel.prescriptions[0].medicamentos.Count-eq1) 'Receta persistida'
Check ($panel.studies[0].resultado.revisado-eq$true) 'Resultado revisado'
Check ($panel.documents.Count-eq1-and$panel.documents[0].nombre-eq'prueba.pdf') 'Documento visible en expediente'
Check ($panel.followups[0].estado-eq'Completado') 'Seguimiento actualizado'
$foreign=Request GET '/panel' $null $other
Check ($foreign.patients.Count-eq0-and$foreign.consultations.Count-eq0-and$foreign.appointments.Count-eq0) 'Aislamiento entre pacientes'
Request GET "/pacientes/$patient" $null $other 403 | Out-Null
Request GET "/pacientes/$patient" $null $otherDr 403 | Out-Null
Request GET '/usuarios' $null $pat 403 | Out-Null
Request GET '/auditoria' $null $dr 403 | Out-Null
$reception=Request GET '/panel' $null $rec
Check ($reception.consultations.Count-eq0-and$reception.prescriptions.Count-eq0) 'Recepción sin acceso clínico'
Check ($reception.payments.Count-eq2) 'Pagos persistidos'
$notifications=Request GET '/notificaciones' $null $pat
Check ($notifications.Count-eq1) 'Notificación real de cita'
Request PATCH '/notificaciones/leidas' $null $pat 204 | Out-Null
$notifications=Request GET '/notificaciones' $null $pat
Check ($notifications[0].leida) 'Notificación leída persistida'
Request PUT '/configuracion' @{nombre='Consultorio de prueba';direccion='Prueba';telefono='7000-0030';correo='clinic@test.local';horario='Lunes a viernes';duracionMinutos=30;anticipoDias=30;cancelacionHoras=24;permitirOnline=$false} $admin 204 | Out-Null
$next=$appointment.Clone();$next.inicio=$start.AddDays(2).ToString('o');$next.fin=$start.AddDays(2).AddMinutes(30).ToString('o')
Request POST '/citas' $next $pat 400 | Out-Null
Request PATCH "/usuarios/$patientUser/activo" @{activo=$false} $admin 204 | Out-Null
Request GET '/panel' $null $pat 401 | Out-Null
Request PATCH "/usuarios/1/activo" @{activo=$false} $admin 400 | Out-Null
$panel=Request GET '/panel' $null $admin
Check ($panel.clinic.nombre-eq'Consultorio de prueba') 'Configuración persistida'
Check ($panel.specialties[0].nombre-eq'Especialidad actualizada') 'Especialidad actualizada'
Check (($panel.doctors|Where-Object id -eq $doctor).especialidad-eq'Especialidad actualizada') 'Médico actualizado con especialidad'
Check (!($panel.users[0].PSObject.Properties.Name -contains 'passwordHash')) 'Sin hashes de contraseñas en respuestas'
Write-Output "OK: $script:checks comprobaciones de integración sobre SQL Server."
$client.Dispose()
