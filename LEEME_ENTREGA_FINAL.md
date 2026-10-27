# MediControl SV — versión pulida para defensa

## Qué aporta este paquete
- El proyecto completo de la versión anterior: interfaz React original de Figma y backend .NET 10.
- Mejoras de accesibilidad/estilo responsive y eliminación de métricas inventadas del login.
- SQL original del usuario, preservado sin alterar.
- Nuevo script de tres triggers: solapamiento de citas, historial y protección de auditoría.
- Consultas de verificación de relaciones, índices y triggers, guion para defensa y comprobación de archivos.

## LIMITACIONES IMPORTANTES
- La base definida por el script SQL original no está mapeada al modelo EF Core del backend. NO son intercambiables aún.
- El frontend original incluye pantallas de demostración con datos estáticos: no afirmar que todos los módulos son CRUD.
- No se pudo ejecutar dotnet ni SQL Server en el entorno de generación. No se puede garantizar funcionamiento sin errores.
- Algunos escenarios médicos requieren autorización por paciente/doctor más rigurosa antes de usar datos personales reales.

## Arranque del prototipo web
`cd frontend && npm install && npm run dev` (Node compatible con Vite 8).

## Arranque del backend EF de demostración (base separada)
Instalar .NET 10 SDK y SQL Server. Configure `Jwt:Key` en user-secrets o variable `Jwt__Key` con al menos 32 bytes, `ConnectionStrings__Default`, `Database__InitializeDevelopment=true`, `Seed__AdminEmail` y `Seed__AdminPassword` de 12+ caracteres con mayúsculas, minúsculas, número y símbolo. Usar el directorio `backend/MediControlSV.Api` y ejecutar `dotnet restore && dotnet run`. No compartir credenciales ni secretos por Git.

## SQL para la defensa
Con SQL Server Management Studio, sobre instancia de pruebas:
1. `database/01_Esquema_Original_FaseI.sql` (crea tablas y datos de catálogo; ejecutar solo UNA vez en una base limpia).
2. `database/02_Triggers_FaseFinal.sql`.
3. `database/03_Validaciones_Demo.sql`.

Consultar `docs/GUIA_DEFENSA_FINAL.md` para las preguntas.
