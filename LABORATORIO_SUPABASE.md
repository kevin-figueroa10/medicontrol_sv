# Activación de laboratorio, resultados privados y fotos

El código está preparado localmente. No publicar antes de ejecutar la actualización SQL y configurar el almacenamiento. La aplicación publicada sigue usando la versión anterior hasta entonces.

## 1. Crear Supabase

1. Entrar a https://supabase.com/dashboard y crear un proyecto llamado MediControl. Conservar su contraseña en un lugar privado.
2. En Storage, crear el bucket `medicontrol-archivos` con **Public desactivado**.
3. Límite del bucket: 5 MB. Tipos permitidos: `application/pdf`, `image/png`, `image/jpeg`.
4. No hace falta trasladar tablas a Supabase: las tablas permanecen en Azure SQL y los archivos van a Storage.
5. Copiar la URL HTTPS del proyecto desde la configuración y localizar la clave secreta de servidor **legacy `service_role`** en API Keys. No usar `anon` ni la clave publicable. La clave se introduce únicamente en Render; nunca en Vercel, GitHub ni el chat.

## 2. Ejecutar la actualización de Azure SQL

1. Abrir SQL Server Management Studio y conectar a `medicontrol-kevin-sv.database.windows.net`.
2. Seleccionar la base **MediControlSV**.
3. Abrir `database/02_Laboratorio_Supabase_Fotos.sql` y ejecutar todo el archivo.
4. Comprobar el mensaje **Actualización de laboratorio y fotos completada** y las columnas `EstudioMedicoId` y `EsFoto`.
5. También se agrega `Interpretacion` a `ResultadosEstudio` y el rol `Laboratorio` a `Roles`.

El script solo agrega columnas, índices, restricciones y el rol que falten. Se puede ejecutar otra vez; no elimina registros. Está protegido con una transacción. Si aparece un error, conservar su mensaje y no publicar todavía.

Para mantener la base local compatible, se puede ejecutar el mismo archivo seleccionando `MediControlSV_FaseII` en localhost. No ejecutar el archivo de exportación completa para esta actualización.

## 3. Configurar variables en Render

En el servicio de la API, Environment, agregar:

| Variable | Valor |
|---|---|
| `Supabase__Url` | URL real `https://SU-PROYECTO.supabase.co`, sin `/storage/v1` |
| `Supabase__ServiceRoleKey` | Clave secreta legacy `service_role` del proyecto |
| `Supabase__Bucket` | `medicontrol-archivos` |

Guardar. Azure SQL conserva su cadena de conexión existente. No agregar estas claves como variables `VITE_*`.

## 4. Publicar después de los pasos anteriores

Avisar que el SQL terminó y las variables están guardadas. Entonces subir el código y esperar los nuevos despliegues de Render y Vercel. No se han ejecutado cambios en Azure ni creado recursos de Supabase automáticamente.

## 5. Crear la cuenta de laboratorio

Entrar como administrador → Usuarios → Crear usuario → Rol **Laboratorio**. Elegir correo, nombre y contraseña fuerte con confirmación. Laboratorio tendrá una pantalla de órdenes y resultados; no verá usuarios, pagos, citas generales ni expedientes clínicos.

## 6. Comprobar el recorrido completo

1. Médico: Estudios → Solicitar estudio para una consulta propia.
2. Laboratorio: iniciar sesión → abrir la orden → elegir PDF, PNG o JPEG → Subir resultado. Máximo 5 MB por archivo y 10 archivos por estudio.
3. Médico: abrir la orden → descargar el archivo → registrar la interpretación → Marcar como revisado. Después de la revisión se bloquean nuevas cargas.
4. Paciente: Mis estudios → abrir únicamente sus resultados → descargar los adjuntos y consultar la interpretación.
5. Foto: administrador/recepción/médico desde el expediente, o paciente desde Mi perfil → Agregar foto. PNG o JPEG, máximo 2 MB. Al reemplazarla se actualiza la referencia y se intenta eliminar el archivo anterior.
6. Reiniciar Render y comprobar que el archivo sigue disponible desde Supabase.

Las descargas pasan por la API autenticada; no se publican enlaces permanentes ni se entregan claves de Supabase al navegador. Se verifican las firmas de los archivos, su tamaño y los permisos. El servidor rechaza cargas si detecta un bucket público.

## Documentos anteriores

Los documentos que ya estaban en el disco local no se copian automáticamente a Supabase. Sus referencias siguen siendo compatibles si los archivos todavía existen en el servidor. Si Render ya los eliminó en un reinicio, hay que recuperarlos del equipo original y volver a cargarlos. Las nuevas cargas en producción requieren Supabase configurado.

## Validación realizada

Hay pruebas de firmas, nombres de archivo, permisos de laboratorio, lectura de estudios propios, rechazo de bucket público y comunicación HTTP con respuestas controladas. Estas pruebas no contactan el proyecto real de Supabase ni ejecutan la migración de Azure. La carga y descarga reales se comprobarán cuando estén configurados los servicios.

Referencias: https://supabase.com/docs/guides/storage/buckets/fundamentals y https://supabase.com/docs/guides/storage/security/access-control
