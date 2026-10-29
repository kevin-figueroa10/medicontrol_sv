# Archivos privados y laboratorio

Los registros y las referencias permanecen en Azure SQL. Supabase Storage conserva fotos y documentos; la API autentica y autoriza cada descarga.

## Configuración

1. Crear un proyecto en Supabase.
2. Crear el bucket `medicontrol-archivos` con Public desactivado. Máximo 5 MB; tipos permitidos `application/pdf`, `image/png`, `image/jpeg`.
3. Guardar en Render `Supabase__Url`, `Supabase__ServiceRoleKey` y `Supabase__Bucket`. Usar la clave legacy `service_role` en el servidor; no publicarla ni entregarla al navegador.
4. Aplicar `database/MediControlSV.sql` antes de publicar esta versión.

## Uso

- Administración crea una cuenta de rol Laboratorio.
- El médico solicita un estudio desde una consulta propia.
- Laboratorio abre la orden y carga PDF, PNG o JPEG: hasta 5 MB por archivo y 10 archivos por estudio.
- El médico consulta los archivos, registra la interpretación y marca el resultado como revisado. Después se bloquean nuevas cargas.
- El paciente ve únicamente sus resultados.
- Fotos: administrador, recepción o médico desde el expediente; el paciente desde Mi perfil. PNG o JPEG de hasta 2 MB. La lista de pacientes muestra su foto.

Se valida la firma del archivo, tamaño, nombre y permisos. La API comprueba que el bucket sea privado antes de cargar. Las referencias son claves opacas; no se publican URL permanentes.

En Development se admite almacenamiento local privado para pruebas. En Production no se guardan cargas nuevas en el disco efímero de Render si falta Supabase: se informa un error de configuración.

Los archivos anteriores que estaban en el disco no se migran automáticamente. Si siguen disponibles pueden leerse con la referencia anterior. Si Render los perdió, hay que recuperarlos del equipo original y cargarlos nuevamente.
