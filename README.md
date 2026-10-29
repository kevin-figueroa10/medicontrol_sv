# MediControl SV

Proyecto de cátedra de ASB 01T para la gestión de un consultorio médico: pacientes, citas, consultas, recetas, laboratorio, documentos privados y pagos.

## Accesos

- Repositorio: https://github.com/kevin-figueroa10/medicontrol_sv
- Aplicación: https://medicontrol-sv-4x4i.vercel.app/login
- Comprobación de API y base: https://medicontrol-sv.onrender.com/api/health

Las cuentas se crean desde Administración. No se publican contraseñas en el repositorio.

## Estructura

```text
backend/MediControlSV.Api/   API en C# y ASP.NET Core
frontend/                   Interfaz React y TypeScript
database/MediControlSV.sql   Único SQL de estructura, vistas y triggers
docs/                       Despliegue, almacenamiento, pruebas y defensa
scripts/                    Inicio local y carga opcional de datos ficticios
tests/                      Comprobaciones de reglas, permisos y componentes
```

## Tecnologías

| Parte | Tecnología |
|---|---|
| Interfaz | React, TypeScript, Vite y Tailwind CSS |
| API | ASP.NET Core 10, C# y Entity Framework Core |
| Datos | SQL Server y Azure SQL Database |
| Archivos privados | Supabase Storage |
| Autenticación | JWT, roles y BCrypt |
| Publicación | Vercel y Render con Docker |

## Base de datos

Ejecutar **solo `database/MediControlSV.sql`** en SSMS, seleccionando `MediControlSV` en Azure o `MediControlSV_FaseII` en localhost. La base debe existir previamente; el script no crea recursos de Azure ni otra base.

Incluye **29 tablas, 31 índices del modelo, claves y restricciones, 8 vistas y 4 triggers de auditoría**. Crea los objetos faltantes y actualiza las vistas y triggers dentro de una transacción. Puede ejecutarse otra vez sin borrar tablas o registros. No reemplaza una migración arbitraria entre esquemas diferentes.

El archivo contiene la estructura y los cinco roles del sistema. No es un respaldo con pacientes, usuarios, contraseñas o resultados reales. Los datos privados se conservan en Azure SQL y no se suben a GitHub.

La API ya incluye la configuración de Entity Framework compatible con los triggers.

## Ejecución local

Requisitos: .NET SDK 10, Node.js 22 o superior y SQL Server local. Revisar la conexión de desarrollo en `backend/MediControlSV.Api/appsettings.Development.json`.

```powershell
dotnet restore backend/MediControlSV.Api
cd frontend
npm ci
cd ..
./scripts/iniciar.ps1
```

Abrir http://127.0.0.1:5173. El iniciador genera una clave JWT temporal para desarrollo. En una instalación sin usuarios, configurar `Seed__AdminEmail` y `Seed__AdminPassword` en el entorno antes de iniciar; la contraseña requiere al menos 12 caracteres, mayúscula, minúscula, número y símbolo, con máximo 72 bytes. El alta inicial de desarrollo solo ocurre si no existen usuarios.

Los documentos de desarrollo pueden guardarse en disco privado. En producción, las nuevas cargas requieren Supabase configurado.

## Roles y flujo

- **Administrador:** usuarios, médicos, servicios, configuración, reportes y auditoría.
- **Recepcionista:** pacientes, citas, llegadas, reprogramación, fotos y cobros.
- **Médico:** sus citas y pacientes, consultas, recetas, estudios y seguimientos.
- **Laboratorio:** órdenes de estudios y carga de resultados; sin acceso al expediente completo, usuarios o pagos.
- **Paciente:** sus citas, resúmenes, recetas, estudios, saldos y foto.

Flujo: registro → cita → llegada → consulta → receta o estudio → cobro → consulta del resumen por el paciente. Los pagos registran operaciones realizadas fuera del sistema; no hay una pasarela bancaria conectada.

## Documentación

- [Despliegue](docs/DESPLIEGUE.md)
- [Archivos privados y laboratorio](docs/ALMACENAMIENTO.md)
- [Vistas, triggers y consultas para la defensa](docs/DEFENSA.md)
- [Pruebas](docs/PRUEBAS.md)
- [Datos ficticios opcionales](docs/DATOS_PRUEBA.md)

Las referencias antiguas, exportaciones privadas y documentos de trabajo permanecen fuera de GitHub. La aplicación no depende de esas copias.
