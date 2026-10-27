Revisa el proyecto MediControl SV actual. NO quiero que rediseñes desde cero ni cambies la identidad visual existente. Conserva exactamente el estilo actual, colores, tipografía, sidebar, dashboards, tablas, tarjetas, componentes y pantallas ya creadas.

Quiero completar las funcionalidades y pantallas que todavía faltan y corregir la navegación por roles.

1. REGISTRO DE PACIENTE

Actualmente existe la opción “Nuevo paciente”, pero necesito una pantalla real de registro de paciente.

Crear un formulario completo con:

DATOS PERSONALES
- Nombres
- Apellidos
- Fecha de nacimiento
- Sexo
- Documento de identificación
- Teléfono
- Correo electrónico
- Dirección

CONTACTO DE EMERGENCIA
- Nombre
- Parentesco
- Teléfono

INFORMACIÓN ADICIONAL
- Observaciones

Agregar:
- Guardar paciente
- Cancelar
- Validaciones visuales
- Mensaje de registro exitoso

La ruta /admin/patients/new debe mostrar este formulario y NO volver al listado de pacientes.


2. GESTIÓN DE MÉDICOS

Crear una pantalla administrativa independiente para “Médicos”.

Debe mostrar una tabla con:
- Código
- Médico
- Especialidad
- Número JVPM
- Teléfono
- Correo
- Horario
- Estado
- Acciones

Agregar:
- Nuevo médico
- Editar médico
- Ver información
- Activar/desactivar

Crear formulario de registro de médico.

La opción Médicos del menú NO debe abrir el Dashboard.


3. ESPECIALIDADES Y SERVICIOS

Crear módulo para especialidades médicas.

Ejemplos:
- Medicina General
- Cardiología
- Pediatría
- Dermatología
- Ginecología

Permitir:
- crear
- editar
- activar/desactivar

Crear también módulo Servicios:

Ejemplos:
- Consulta general
- Consulta especializada
- Control médico

Campos:
- nombre
- descripción
- precio
- duración estimada
- estado


4. SEGUIMIENTOS

Actualmente Seguimientos reutiliza incorrectamente la pantalla de Estudios.

Crear una pantalla independiente.

Tabla:
- Paciente
- Médico
- Última consulta
- Motivo del seguimiento
- Fecha recomendada
- Estado
- Acciones

Estados:
- Pendiente
- Programado
- Completado
- Vencido

Agregar formulario:

- Paciente
- Consulta relacionada
- Fecha recomendada
- Motivo
- Indicaciones
- Observaciones

Agregar botón:
“Agendar cita de seguimiento”.


5. COMPLETAR EXPEDIENTE CLÍNICO

El expediente actual tiene las pestañas:
Resumen
Historial de consultas
Signos vitales
Recetas
Estudios médicos
Seguimientos
Citas
Documentos

Las primeras están bien.

Completar las pestañas:

SEGUIMIENTOS
Mostrar historial de seguimientos con fecha, médico, motivo y estado.

CITAS
Mostrar citas anteriores y próximas del paciente.

DOCUMENTOS
Mostrar archivos médicos del paciente con:
- Nombre
- Tipo
- Fecha
- Médico
- Ver
- Descargar

Mantener estados vacíos cuando corresponda, pero utilizar datos de demostración para mostrar cómo se verán.


6. RESULTADOS DE ESTUDIOS

Separar:
- Solicitud de estudio
- Registro de resultado
- Visualización del resultado

Crear una pantalla/modal “Registrar resultado”.

Campos:
- Paciente
- Estudio
- Fecha
- Descripción del resultado
- Observaciones
- Archivo adjunto PDF/JPG/PNG

Agregar:
- Guardar resultado
- Ver documento
- Descargar documento

El médico podrá revisar posteriormente el resultado.


7. PORTAL DEL PACIENTE

MUY IMPORTANTE:
El paciente NO debe utilizar las pantallas administrativas ni las pantallas de edición del médico.

Crear versiones independientes, de solo lectura cuando corresponda.

Rutas conceptuales:

/patient/book
/patient/prescriptions
/patient/studies
/patient/followups
/patient/profile

PACIENTE – AGENDAR CITA

Mantener el proceso:
Especialidad →
Médico →
Fecha →
Hora →
Motivo →
Confirmación.

Pero usar el diseño del portal del paciente.


PACIENTE – MIS RECETAS

El paciente solamente puede:
- ver recetas
- consultar medicamentos
- consultar indicaciones
- imprimir/descargar

NO debe poder crear ni modificar recetas.


PACIENTE – MIS ESTUDIOS

El paciente solamente puede:
- consultar estudios solicitados
- conocer estado
- visualizar resultados disponibles
- descargar sus documentos

NO debe aparecer “Solicitar estudio”.


PACIENTE – SEGUIMIENTOS

Mostrar:
- médico
- motivo
- fecha recomendada
- estado
- opción para agendar cita cuando corresponda.


PACIENTE – MI PERFIL

Crear pantalla real para:
- nombres
- fecha de nacimiento
- teléfono
- correo
- dirección
- contacto de emergencia

Permitir editar únicamente datos personales permitidos.


8. REPROGRAMAR Y CANCELAR CITAS

En “Mis citas” del paciente, hacer interactivos los botones:

REPROGRAMAR
Debe permitir seleccionar otra fecha y horario disponible y mostrar una confirmación.

CANCELAR
Debe abrir un modal:
“¿Está seguro de cancelar esta cita?”

Mostrar mensaje posterior:
“Cita cancelada correctamente.”


9. CONFIGURACIÓN

Crear una pantalla administrativa de configuración.

Secciones:
- Información del consultorio
- Nombre
- Dirección
- Teléfono
- Correo
- Horario general
- Duración predeterminada de consulta
- Configuración de citas
- Configuración de notificaciones

No crear configuraciones excesivamente técnicas.


10. RECUPERACIÓN DE CONTRASEÑA

Crear flujo:

Login
→ ¿Olvidaste tu contraseña?
→ Ingresar correo
→ Mensaje de solicitud enviada
→ Crear nueva contraseña.

Mantener el mismo diseño del Login.


11. RECEPCIONISTA

Crear dashboard propio para Recepción.

Mostrar:
- Citas de hoy
- Pacientes pendientes
- Pacientes en espera
- Pacientes atendidos
- Próximas citas

Accesos rápidos:
- Nueva cita
- Nuevo paciente
- Registrar llegada
- Buscar paciente

La recepcionista NO debe visualizar:
- Auditoría
- Gestión de roles
- Configuración administrativa
- Información clínica que no necesite para realizar su trabajo.


12. SEGURIDAD VISUAL POR ROLES

Revisar toda la navegación.

ADMINISTRADOR:
Administración completa.

MÉDICO:
Agenda, pacientes asignados, expediente clínico, consultas, recetas, estudios y seguimientos.

RECEPCIONISTA:
Pacientes, citas, agenda, sala de espera y pagos.

PACIENTE:
Únicamente su propia información.

No permitir visualmente que un rol acceda a pantallas correspondientes a otro rol.


13. RESPONSIVE

Mantener el diseño responsive actual.

En celular:
- sidebar convertido en menú hamburguesa;
- tablas complejas transformadas en tarjetas;
- botones adaptados;
- formularios de una columna;
- calendarios utilizables.


IMPORTANTE:

NO eliminar ni rediseñar las pantallas que ya están bien.

Solo completar lo faltante, corregir navegación, crear las pantallas indicadas y mantener exactamente la identidad visual actual de MediControl SV.