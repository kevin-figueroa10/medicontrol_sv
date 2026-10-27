# Seguridad y preparación del backend

La clave JWT no se distribuye en el ZIP: configure `Jwt:Key` como secreto local.

```powershell
cd backend/MediControlSV.Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "REEMPLAZAR_CON_UNA_CLAVE_ALEATORIA_SEGURA_DE_64_CARACTERES"
dotnet user-secrets set "Seed:AdminEmail" "admin@local.test"
dotnet user-secrets set "Seed:AdminPassword" "REEMPLAZAR_CON_CONTRASENA_DE_12_O_MAS_CARACTERES_1!"
dotnet user-secrets set "Database:InitializeDevelopment" "true"
dotnet restore
dotnet run
```

**NO desplegar en producción sin migraciones, pruebas de integración, gestión de secretos, TLS real, backups cifrados, revisión legal de datos clínicos, respuesta a incidentes y control de acceso clínico de mínimo privilegio.**

Las páginas heredadas del Figma conservan datos simulados en varias secciones: no deben utilizarse para expedientes reales. El token se guarda temporalmente en sessionStorage: para producción migrar a sesión BFF con cookies HttpOnly/SameSite y protección CSRF.
