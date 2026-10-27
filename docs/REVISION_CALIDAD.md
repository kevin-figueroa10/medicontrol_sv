# Evaluación honesta del grado de completitud

## Se ha implementado como código
- 29 tipos de entidades según la clasificación funcional de Fase I; relaciones principales, FKs por convenciones EF Core, índices y restricciones monetarias.
- JWT, contraseña con hash BCrypt, defensa básica contra fuerza bruta, permisos para operaciones sensibles.
- CRUD parcial de pacientes, citas con verificación de solapamientos en transacción SERIALIZABLE, registro de consultas y recetas, pagos, solicitudes de estudios, seguimiento y auditoría parcial.
- Vista React de pacientes y agenda que consume API; login real.

## No está completado todavía
- Los 16 casos de uso con todos sus flujos y excepciones; sincronización completa Figma/API.
- Migraciones de esquema y actualización segura de BD; administración de permisos granulares.
- Integración automatizada de pruebas, E2E, revisión de seguridad, accesibilidad y despliegue.
- Portal del paciente funcional para cada recurso, ciclo completo de estudios y archivos, recetas imprimibles, recuperación y notificaciones.
- Cumplimiento legal y políticas clínicas de producción; no usar con datos reales.

## Pruebas recomendadas
1. Acceso: contraseña equivocada 5 veces; acceso por rol; JWT caducado; acceso sin token.
2. Paciente: duplicado de documento, fecha futura, nombre vacío, correo inválido, longitud excesiva.
3. Cita: mismo médico en horas coincidentes, médico inactivo, paciente inexistente, cancelación, fechas invertidas.
4. Médico: lectura de expediente de otro paciente debe denegarse siempre.
5. Pago: monto cero/negativo; método fuera de catálogo; datos no válidos.
6. Revisar migraciones y SQL Server en base limpia y una base con datos de prueba.
