# Alcance y defensa

## Origen
La Fase I establece cuatro roles, 16 casos de uso, 29 tablas previstas y módulos administrativos/clínicos. La consigna indica que la Fase II debe programar el sistema y su base de datos.

## Qué contiene el ZIP
1. El diseño React de Figma, sin sustituir su apariencia.
2. API ASP.NET Core 10 con EF Core SQL Server.
3. Entidades de usuarios, pacientes, médicos, servicios, citas, consultas, recetas, estudios, seguimientos, pagos y auditoría.
4. Autenticación JWT, contraseñas con BCrypt y protección por rol de rutas de API.
5. Endpoints de pacientes, agenda/citas, consultas y pagos; control de solapamientos de citas.

## Qué falta para cumplir la Fase II íntegra
- Implementar las 29 tablas con relaciones y restricciones completas.
- Conectar cada pantalla Figma con el backend; hoy el diseño usa datos simulados.
- Completar CRUD de recetas, estudios, resultados, seguimientos, notificaciones, auditoría, reportes, horarios y usuarios.
- Crear portal del paciente con autorización por propietario de recurso.
- Probar validaciones, roles, protección de datos, recuperación de contraseña, concurrencia, despliegue y copias de seguridad.

## Defensa técnica
- Modelo: cada clase representa entidad persistida por EF Core.
- DbContext: define DbSet y reglas de índices y relaciones.
- API: endpoints controlan validación, permisos y conflictos de agenda.
- JWT: token firmado después de validar contraseña cifrada con hash.
- Frontend: React + Vite conserva el prototipo de Figma y requiere integración para datos reales.

## Nota de seguridad
La cuenta inicial es solamente para desarrollo. No almacenar expedientes reales ni desplegar el sistema públicamente sin auditoría de seguridad y cumplimiento legal.
