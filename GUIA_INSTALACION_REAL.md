# MediControl SV · Instalación sin datos simulados

## Requisitos
- Windows, Visual Studio 2022/2026 con SDK .NET 10 y SQL Server Developer/Express.
- Node.js 22 o superior; acceso a NuGet y npm para instalar dependencias.
- Base de datos dedicada **MediControlSV_FaseII**. **NO EJECUTAR** scripts bajo `database/REFERENCIA_NO_EJECUTAR_*`: son esquemas de la Fase I incompatibles con los nombres del modelo EF actual.

## 1. Preparar credenciales privadas
Dentro de `backend/MediControlSV.Api` ejecutar:
```powershell
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "REEMPLAZA-ESTO-POR-UN-SECRETO-ALEATORIO-DE-MAS-DE-32-CARACTERES"
dotnet user-secrets set "Seed:AdminEmail" "admin@tudominio.local"
dotnet user-secrets set "Seed:AdminPassword" "CAMBIAR_POR_UNA_CLAVE_FUERTE_123!"
```
No uses las cadenas de ejemplo como credenciales finales. Elige contraseña única, privada, con longitud >=12, mayúscula, minúscula, número y símbolo; conserva el secreto JWT fuera del código.

## 2. Crear la base relacional compatible
Verifica conexión de SQL Server en `appsettings.Development.json`. El primer arranque en Development y con `Database:InitializeDevelopment=true` ejecuta `EnsureCreatedAsync`, crea las tablas del modelo EF con PK/FK/índices y registra SOLO el administrador inicial suministrado por configuración y el catálogo básico de servicios. No crea pacientes, citas, consultas, pagos ni médicos ficticios. Usa una base NUEVA vacía; no uses `EnsureCreated` en bases existentes con otro esquema. No se incluyen migraciones administradas para cambios posteriores.

## 3. Encender backend
```powershell
cd backend/MediControlSV.Api
dotnet restore
dotnet run --urls http://localhost:5080
```
Verifica `http://localhost:5080/api/health` y que responde `baseDatos: conectada`.

## 4. Instalar triggers en SQL Server
Después de crear las tablas, abre SSMS, selecciona la instancia correcta y ejecuta `database/ACTIVAR_TRIGGERS_EF.sql`. Si cambia el nombre de la base actualiza el `USE` del archivo. El trigger verifica conflictos de horarios y un segundo protege montos positivos.

## 5. Encender frontend
```powershell
cd frontend
npm install
npm run dev
```
Abre `http://localhost:5173`, entra con el administrador real. Para iniciar el flujo: Usuarios → crear cuenta Médico → Médicos → registrar JVPM vinculado → Pacientes → Citas → médico cambia a 'En consulta' → Consultas → Recetas/Estudios/Seguimientos → Pagos. Para el portal del paciente vincula una cuenta de rol Paciente al expediente por API `POST /api/pacientes/{id}/vincular/{usuarioId}` con token de administrador. No uses datos clínicos reales para demostraciones sin controles de protección adecuados.

## Estado de pruebas / límites conocidos
- NO se compiló el backend .NET en el entorno de generación: el SDK dotnet no estaba disponible.
- NO se pudo completar instalación npm en el entorno de generación (timeout). Compila ambos proyectos en Windows antes de entrega.
- Hay flujos no implementados de extremo a extremo: resultados/archivos médicos, recuperación de contraseña, agenda de médico con horario semanal, reportes avanzados, preferencias de notificación y gestión integral de permisos. No se presentan como completos.
- La interfaz ofrece formularios y vistas conectadas a API, pero no equivale a un producto médico listo para producción o a un sistema certificado para información clínica sensible.
- No expongas este servidor al público ni uses datos personales reales antes de auditoría profesional, cifrado, respaldos, controles de consentimiento y revisión legal.
