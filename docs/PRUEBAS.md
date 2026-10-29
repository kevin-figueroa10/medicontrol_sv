# Pruebas del proyecto

Desde la raíz:

```powershell
python scripts/verificar_archivos.py
dotnet build backend/MediControlSV.Api
dotnet run --project tests/MediControlSV.Checks
dotnet run --project tests/MediControlSV.StorageChecks
node tests/appointment-status.mjs
node tests/doctor-slots.mjs
node tests/payment-balances.mjs
node tests/patient-summary.mjs
node tests/mobile-api.mjs
cd frontend
npx tsc --noEmit
npm run build
```

Las comprobaciones de almacenamiento usan respuestas HTTP controladas para verificar el protocolo, los permisos y el rechazo de un bucket público; no crean archivos en Supabase ni modifican Azure. Las pruebas de interfaz verifican selección de datos y representación del resumen.

## Integración con SQL Server local

```powershell
dotnet build backend/MediControlSV.Api -p:UseAppHost=false -o .checks/backend-final
./tests/ejecutar-integracion.ps1
```

Requiere SQL Server local, permisos para una base temporal y sqlcmd. El script crea una base `MediControlSV_Test_<fecha>`, ejecuta las comprobaciones y elimina esa base temporal. No debe apuntarse a producción. La base de trabajo local y Azure permanecen separadas.

El SQL único puede validarse sintácticamente con ScriptDom sin conectarse a una base. Esa revisión no reemplaza comprobar su ejecución sobre el servidor de destino.
