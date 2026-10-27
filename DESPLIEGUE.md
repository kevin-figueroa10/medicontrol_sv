# Desplegar MediControl SV con Azure SQL Database

Decisión actual: conservar SQL Server y ASP.NET Core. Azure SQL Database sustituye al SQL Server local en el despliegue. No se necesita PostgreSQL ni Supabase para la base.

Estado: archivos iniciales preparados; no se ha creado ni publicado ningún recurso remoto. El contenedor y la conexión Azure todavía requieren verificación.

## Tecnologías

| Parte | Tecnología | Destino |
|---|---|---|
| Interfaz | React 19, TypeScript, Vite 8, Tailwind CSS 4 | Vercel |
| API | C#, ASP.NET Core 10 Minimal API | Render con Docker |
| Persistencia | Entity Framework Core 10 y Microsoft.Data.SqlClient | Azure SQL Database |
| Autenticación | JWT, roles y BCrypt | API en Render |
| Código y despliegues | Git y repositorio GitHub privado | GitHub integrado con Vercel y Render |
| Documentos clínicos | Descarga privada autenticada | Configurar Azure Blob Storage o un disco persistente; aún pendiente |

## 1. Crear las cuentas

Crear o iniciar sesión en GitHub, Azure, Render y Vercel. Crear un repositorio privado `medicontrol-sv`. La sesión GitHub CLI de este equipo requiere autenticarse nuevamente. No publicar contraseñas, claves JWT, archivos `.env`, respaldos ni documentos clínicos.

## 2. Crear la base en Azure

En Azure Portal, utilizar la oferta gratuita oficial de Azure SQL Database y crear una base llamada `MediControlSV`. Crear el servidor lógico solicitado por el portal.

La documentación consultada indica 100 000 segundos de vCore mensuales, 32 GB de datos y 32 GB de respaldos por base incluida. Revisar elegibilidad y condiciones en el portal. Seleccionar la opción de pausar hasta el siguiente mes al consumir el límite gratuito, en lugar de continuar generando cargos. La pausa puede dejar la aplicación sin acceso a datos hasta la renovación del cupo.

Configurar las reglas de red para las direcciones salientes de Render y, durante la transferencia, para la IP del equipo local. No es necesario abrir el servidor a todas las IP.

La conexión remota usa TLS (`Encrypt=True;TrustServerCertificate=False`) y un usuario de base de datos con permisos limitados para la API. La autenticación Windows utilizada en localhost no se traslada directamente a Render.

## 3. Preparar esquema y datos

Respaldar la base local. Exportar el esquema completo compatible con Azure SQL y transferir los datos que se decida conservar. Verificar cantidades, claves foráneas, identidades, índices y restricciones. `SchemaUpgrade.sql` solo contiene ampliaciones; no es el esquema completo.

Para conservar la oferta gratuita, crear primero la base gratuita y después desplegar el esquema y cargar sus tablas en esa base existente. La oferta no permite restaurar o convertir una base existente a la capa gratuita. Evitar un asistente de importación que cree una base de pago. No subir respaldos al repositorio.

El inicializador actual solo actúa en Development. La base remota debe estar preparada antes de ejecutar el contenedor con `ASPNETCORE_ENVIRONMENT=Production`.

## 4. Preparar la API para internet

- Configurar CORS con el dominio exacto de Vercel. Actualmente solo admite localhost.
- Revisar los encabezados del proxy de Render y HTTPS antes de activar redirecciones en producción.
- Configurar la clave JWT nueva y persistente en las variables secretas de Render.
- Probar el contenedor Docker y la conexión a Azure SQL; considerar reintentos controlados ante pausas o fallos transitorios de la base.
- Preparar almacenamiento privado persistente para los documentos; Azure SQL no reemplaza por sí sola los archivos del disco local.
- Revisar la comprobación de salud: consultar frecuentemente una base serverless puede mantenerla activa y consumir su cupo. Separar la salud del proceso de la disponibilidad de la base antes de configurar monitorización continua.

## 5. Subir el código a GitHub

Revisar los archivos que se incluirán, inicializar Git, realizar el primer commit y subirlo al repositorio privado elegido. Los archivos sensibles y generados están excluidos por `.gitignore`. Todavía no se ejecutaron estos pasos.

## 6. Desplegar Render

Crear un Web Service desde GitHub:

- Runtime: Docker.
- Dockerfile Path: `backend/MediControlSV.Api/Dockerfile`.
- Build Context: raíz del repositorio.
- Puerto de la definición actual: 8080.
- Entorno: Production.

Variables de servidor necesarias:

- `ConnectionStrings__Default`: conexión a Azure SQL con TLS y credenciales del usuario de aplicación.
- `Jwt__Key`: secreto criptográfico nuevo, de al menos 32 bytes.
- `Jwt__Issuer` y `Jwt__Audience`: valores acordados para el despliegue.
- Origen permitido de Vercel: añadir configuración de CORS al código antes de publicar.
- Configuración del almacenamiento privado elegido.

No poner secretos de base de datos o JWT en variables `VITE_*`.

## 7. Desplegar Vercel

Importar el mismo repositorio:

- Root Directory: `frontend`.
- Framework: Vite.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- `VITE_API_URL`: URL HTTPS del servicio de Render, sin añadir `/api` al final.

`frontend/vercel.json` ya incluye las rutas necesarias para abrir pantallas como `/admin/patients` directamente.

## 8. Verificación remota

Probar inicio de sesión y vencimiento de sesión, permisos por rol, pacientes, cruces de citas, consultas, recetas, pagos, reportes y persistencia tras reiniciar. Probar carga y descarga privada de documentos y las respuestas cuando la base está pausada. Usar credenciales nuevas para la publicación; conservar los datos de demostración claramente identificados.

## Fuentes oficiales

- https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier?view=azuresql
- https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier-faq?view=azuresql
- https://learn.microsoft.com/en-us/sql/connect/ado-net/connection-string-syntax
- https://render.com/docs/docker
- https://vercel.com/docs/frameworks/frontend/vite
