# Despliegue de MediControl SV

## Azure SQL

1. Crear una base `MediControlSV` en Azure SQL. Si se usa la oferta gratuita, elegir la pausa al agotar el cupo en lugar de cargos adicionales.
2. Seleccionarla en SSMS y ejecutar completo `database/MediControlSV.sql`. También sirve para completar los cambios previstos en una instalación existente compatible.
3. Permitir en el firewall los rangos salientes que muestre el servicio de Render. No abrir todas las IP.
4. Conservar contraseñas y respaldos fuera de GitHub. El SQL del repositorio no transporta los datos privados de una instalación.

## Render

Importar el repositorio como Web Service con Docker. Root Directory vacío, Dockerfile `backend/MediControlSV.Api/Dockerfile`, contexto raíz y puerto 8080. El Dockerfile incluye el SQL único entre los archivos publicados.

Variables de servidor:

| Variable | Contenido |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_HTTP_PORTS` | `8080` |
| `ConnectionStrings__Default` | Conexión a Azure SQL con `Encrypt=True;TrustServerCertificate=False` |
| `Jwt__Key` | Secreto aleatorio persistente de al menos 32 bytes |
| `Jwt__Issuer` | `MediControlSV` |
| `Jwt__Audience` | `MediControlSV` |
| `Cors__AllowedOrigins` | Dominios HTTPS adicionales autorizados, separados por comas y sin `/login` |
| `Supabase__Url` | URL HTTPS del proyecto de Supabase |
| `Supabase__ServiceRoleKey` | Clave privada de servidor legacy `service_role` |
| `Supabase__Bucket` | `medicontrol-archivos` |

No poner secretos en variables VITE. El inicializador de bases no modifica producción: ejecutar el SQL manualmente antes de publicar cambios que necesiten nuevas columnas. La instalación en una base nueva de producción también requiere aprovisionar de forma controlada su cuenta administradora; no hay una contraseña universal incluida.

## Vercel

Importar el mismo repositorio. Root Directory `frontend`, Framework Vite, Build Command `npm run build`, Output Directory `dist`.

En producción el navegador usa `/api` en el mismo dominio. `frontend/vercel.json` reenvía esas solicitudes a Render antes de aplicar la ruta de la SPA. `VITE_API_URL` solo se utiliza para desarrollo; no hace falta configurar secretos de Supabase o SQL en Vercel.

Compartir el dominio de producción. Si exige una cuenta de Vercel, revisar Deployment Protection y qué dominios están protegidos.

## Verificación

Esperar a que la misma versión esté Live en Render y Ready en Vercel. Verificar `/api/health`, inicio de sesión, permisos por rol, creación y reprogramación de citas, consulta finalizada, saldos, descarga privada y persistencia de archivos después de reiniciar.

Un plan gratuito puede tener pausas o arranque lento. No confundir disponibilidad temporal con pérdida de los datos.
