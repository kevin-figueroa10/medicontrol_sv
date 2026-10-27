# MediControl SV

Aplicación React + ASP.NET Core 10 + SQL Server. La interfaz activa conserva el diseño del archivo `catedrafase1.zip`: menú lateral, paneles, agenda, tablas, tarjetas, formularios y vistas de impresión. El original se conserva en `reference/figma/` únicamente como referencia visual.

## Ejecutar en desarrollo

Requisitos: .NET SDK 10, Node.js 22 o superior y SQL Server local con autenticación Windows. Revise la conexión en `backend/MediControlSV.Api/appsettings.Development.json` si utiliza otra instancia.

En PowerShell, desde la carpeta del proyecto:

```powershell
./scripts/iniciar.ps1
```

Abrir http://127.0.0.1:5173. El script genera una clave JWT de desarrollo para el proceso; al reiniciar el servidor, vuelva a iniciar sesión. No hay credenciales escritas en el repositorio. La cuenta local existente se conserva.

Para una base completamente nueva, configure `Seed__AdminEmail` y `Seed__AdminPassword` en el entorno antes de iniciar. La contraseña necesita al menos 12 caracteres, mayúscula, minúscula, número y símbolo (máximo 72 bytes). El alta inicial solo sucede cuando no existen usuarios.

## Operación

1. En Especialidades, registrar las especialidades y revisar los servicios, precios y duraciones.
2. En Usuarios, crear las cuentas Médico, Recepcionista o Paciente. Las cuentas de paciente pueden vincularse al expediente.
3. En Médicos, vincular la cuenta y configurar los días y horas de atención.
4. Registrar pacientes y agendar citas con el asistente de pasos.
5. Recepción registra la llegada; el médico inicia la atención, guarda consulta y signos vitales, emite recetas y registra estudios o seguimientos. Finalizar requiere una consulta guardada.
6. Los pacientes consultan sus propios datos desde el portal. Los pagos son registros de cobros; no se ejecutan operaciones bancarias.

## Comprobaciones

```powershell
dotnet build backend/MediControlSV.Api
dotnet run --project tests/MediControlSV.Checks
cd frontend
npm run build
npx tsc --noEmit
```

Para integración SQL, desde la raíz:

```powershell
dotnet build backend/MediControlSV.Api -p:UseAppHost=false -o .checks/backend-final
./tests/ejecutar-integracion.ps1
```

La integración crea una base `MediControlSV_Test_<fecha>`, ejecuta 93 comprobaciones y elimina exclusivamente esa base temporal y sus archivos de prueba. Necesita SQL Server y `sqlcmd`; no modifica los registros de la base de la app.

## Persistencia y despliegue

En desarrollo, `EnsureCreated` prepara una base nueva y `SchemaUpgrade.sql` agrega las columnas necesarias sin eliminar datos. Para otra instalación, respaldar y aplicar ese script de forma controlada; no es un sistema completo de migraciones de producción. Los documentos se almacenan en una carpeta privada `App_Data/Documentos`, con descarga autenticada. `Documents__Root` permite configurar su ubicación.

Las sesiones duran 30 minutos. Las notificaciones de citas se guardan dentro del sistema. Correo, SMS, recuperación de contraseña por correo y una pasarela bancaria no están conectados a proveedores externos. No se muestran confirmaciones falsas para esas funciones. El diseño y los flujos locales comprobados no equivalen a una certificación para operar con información médica real.
