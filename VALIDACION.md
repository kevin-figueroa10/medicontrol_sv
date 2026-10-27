# Verificación del diseño conectado — 26 de octubre de 2026

La app activa utiliza las pantallas originales de `catedrafase1.zip`, conservadas sin alterar en `reference/figma`. Se retiró de las rutas el panel genérico que había sustituido al diseño.

## Verificado

- Compilación del backend: sin errores.
- TypeScript y compilación de producción del frontend: sin errores.
- 188 comprobaciones de contraseñas, correo, UTC, permisos y transiciones.
- 93 comprobaciones de integración contra SQL Server en una base temporal independiente, eliminada al terminar.
- Revisión en navegador del panel, pacientes, formulario con errores, médicos, agenda, sala de espera, pagos, reportes, usuarios, auditoría y configuración.

## Flujos conectados

- Pacientes: creación, edición, búsqueda, filtros, paginación, estado, contacto de emergencia y expediente seleccionado por ID.
- Usuarios: cuentas y roles reales; vinculación con pacientes; activación y edición; bloqueo de la desactivación de la propia cuenta y del último administrador.
- Médicos: cuenta vinculada, JVPM único, especialidad, contacto, días y horas de atención. Las citas y reprogramaciones se rechazan fuera de jornada o ante cruces y bloqueos.
- Especialidades y servicios: altas, edición, activación, descripciones, precios y duración.
- Agenda: día, semana y mes con fechas actuales; asistente de reserva con disponibilidad consultada en el servidor.
- Sala de espera: llegada registrada en historial, espera calculada desde el registro real, atención por el médico vinculado, finalización solo después de guardar consulta.
- Consulta: motivo, antecedentes, evaluación, diagnóstico, tratamiento, recomendaciones, observaciones y signos vitales persistidos y validados.
- Recetas: medicamentos e indicaciones guardados en una transacción; vistas de impresión del diseño original.
- Estudios: solicitud, resultado y revisión con permisos por médico; lectura del paciente.
- Seguimientos: registro, vinculación a cita del mismo paciente y actualización de estado.
- Pagos: referencia para tarjeta o transferencia, precisión de dos decimales, pagos parciales y rechazo de excedentes. El precio de la cita se conserva aunque cambie el catálogo.
- Reportes: gráficos, filtros de fechas y exportación CSV derivados de registros reales.
- Auditoría: últimas 500 acciones registradas con usuario y módulo; búsquedas y filtros.
- Portal del paciente: citas propias, cancelación y reprogramación según plazo, recetas, estudios, seguimientos y perfil vinculado.
- Documentos: carga privada PDF/PNG/JPEG hasta 5 MB, comprobación de firma y descarga autenticada; se probó el rechazo de archivos y accesos ajenos.
- Configuración: consultorio, anticipo de reservas, plazo de cancelación, duración y permiso de reservas en línea. Cambio de contraseña con comprobación de la actual.
- Notificaciones: avisos de citas almacenados en SQL y marcado de lectura real.

## Alcance de las pruebas SQL

Se comprobaron respuestas válidas y rechazos por duplicado, datos inválidos, permisos ajenos, horarios fuera de jornada, transiciones inválidas, signos fuera de rango, listas nulas, excesos de pago y referencia faltante. También se verificó la lectura posterior de registros guardados, el aislamiento entre pacientes, la descarga privada de documentos, la persistencia de configuración y la conservación del precio acordado. Las pruebas no introducen pacientes ni datos clínicos de ejemplo en la base de uso de la app.

## Límites que permanecen

No hay integración externa de correo, SMS ni pasarela bancaria. No se simula el envío ni el cobro. Los documentos se validan por tamaño y firma; esto no constituye un análisis antivirus. La auditoría de vulnerabilidades de NuGet no estuvo disponible por conectividad (advertencia NU1900). No se realizaron pruebas de carga, auditoría de infraestructura ni certificación para uso médico en producción. Los cambios de esquema de desarrollo están en `SchemaUpgrade.sql`; para otro entorno se deben aplicar de forma controlada y con respaldo.
