# Vistas y triggers de MediControl SV

Se prepararon 8 vistas y 4 triggers. Este número cubre los módulos del proyecto, pero no reemplaza los requisitos de una rúbrica que no se haya revisado.

## Orden de ejecución

1. Conectar en SSMS y seleccionar `MediControlSV` o `MediControlSV_FaseII`.
2. Ejecutar completo `database/MediControlSV.sql`, único SQL del repositorio.
3. La API incluye la compatibilidad de Entity Framework con triggers.
4. Usar las consultas siguientes durante la defensa.

La preparación del archivo no significa que se haya ejecutado automáticamente en Azure.

## Vistas

| Vista | Propósito |
|---|---|
| `vw_UsuariosPublicos` | Usuarios y roles sin hashes de contraseñas ni tokens. El nombre no concede acceso público a la base. |
| `vw_PacientesResumen` | Datos del paciente, cantidad de citas y última consulta. |
| `vw_MedicosHorarios` | Médicos y sus jornadas semanales; puede haber varias filas por médico. |
| `vw_CitasDetalle` | Relaciona paciente, médico y servicio; identifica citas anteriores no atendidas según la fecha de El Salvador. |
| `vw_ConsultasDetalle` | Atención registrada y signos vitales asociados a cada consulta. |
| `vw_SaldosCitas` | Precio acordado, pagos válidos y saldo por cita; distingue sin pagar, pago parcial, pagado y sin costo. |
| `vw_PagosDetalle` | Cada pago relacionado con paciente, cita, médico y servicio. |
| `vw_EstudiosResultados` | Orden, resultado, interpretación, revisión médica y cantidad de archivos adjuntos. |

Las vistas son consultas reutilizables, no copias nuevas de los datos. No tienen orden fijo: se agrega ORDER BY al consultarlas. No sustituyen los permisos de la API ni filtran por sí solas al médico que inició sesión. Su acceso desde SQL depende de los permisos otorgados a la cuenta de la base de datos.

`vw_SaldosCitas` suma únicamente pagos con estado Pagado. Las citas canceladas o no asistidas muestran No aplica y no se presentan como deuda cobrable; no se simulan devoluciones. Los valores recibidos permanecen visibles como TotalPagado.

## Triggers

| Trigger | Evento | Resultado |
|---|---|---|
| `trg_Usuarios_CambioEstado` | UPDATE de Activo con cambio efectivo | Auditoría del estado anterior y nuevo. |
| `trg_Servicios_CambioPrecio` | UPDATE de Precio con cambio efectivo | Auditoría del precio anterior y nuevo. |
| `trg_Pagos_Registro` | INSERT de uno o varios pagos | Una entrada de auditoría por pago. |
| `trg_Pacientes_CambioTelefono` | UPDATE de Telefono con cambio efectivo | Auditoría del cambio sin copiar el teléfono a la descripción. |

Todos procesan el conjunto completo de inserted y deleted, usan SET NOCOUNT ON y participan en la transacción original. Si la operación se revierte, también se revierte su auditoría. La API conserva su auditoría propia; las entradas de estos triggers se distinguen por la acción TRIGGER_. UsuarioId queda NULL porque un trigger no conoce de forma confiable al usuario de la aplicación.

Las restricciones y validaciones existentes siguen controlando importes, relaciones, horarios y permisos. No se crearon triggers adicionales para duplicar esas reglas ni para modificar expedientes clínicos automáticamente.

## Consultas para la defensa

```sql
-- CONSULTAS PARA LA DEFENSA. Seleccionar MediControlSV.
-- Ejecutar los bloques que se quieran mostrar por separado.
SELECT TOP(20) * FROM dbo.vw_UsuariosPublicos ORDER BY UsuarioId;
SELECT TOP(20) * FROM dbo.vw_PacientesResumen ORDER BY PacienteId DESC;
SELECT * FROM dbo.vw_MedicosHorarios ORDER BY MedicoId,DiaSemana;
SELECT TOP(20) * FROM dbo.vw_CitasDetalle ORDER BY Fecha DESC;
SELECT TOP(20) * FROM dbo.vw_ConsultasDetalle ORDER BY ConsultaId DESC;
SELECT * FROM dbo.vw_SaldosCitas
WHERE EstadoCita=N'Finalizada' AND SaldoPendiente>0 ORDER BY Fecha DESC;
SELECT TOP(20) * FROM dbo.vw_PagosDetalle ORDER BY PagoId DESC;
SELECT TOP(20) * FROM dbo.vw_EstudiosResultados ORDER BY EstudioId DESC;

-- Buscar a una paciente sin distinguir acentos o mayúsculas.
SELECT * FROM dbo.vw_PacientesResumen
WHERE Nombre COLLATE Latin1_General_CI_AI LIKE N'%Ana%Lucia%';

-- Citas anteriores que quedaron sin atender.
SELECT * FROM dbo.vw_CitasDetalle
WHERE EstadoMostrado=N'No atendida' ORDER BY Fecha DESC;

-- Registros generados por los triggers.
SELECT TOP(20) Id,Accion,Entidad,EntidadId,Descripcion,FechaUtc
FROM dbo.Auditorias WHERE Accion LIKE N'TRIGGER[_]%' ORDER BY Id DESC;

```

## Prueba de un trigger sin conservar cambios

Ejecutar el bloque completo en una sola ventana. El ROLLBACK revierte el cambio y su auditoría.

```sql
BEGIN TRANSACTION;
DECLARE @Servicio int=(SELECT MIN(Id) FROM dbo.Servicios WHERE Precio<9999999999.98);
DECLARE @Antes int=ISNULL((SELECT MAX(Id) FROM dbo.Auditorias),0);
UPDATE dbo.Servicios SET Precio=Precio+0.01 WHERE Id=@Servicio;
SELECT Accion,Entidad,EntidadId,Descripcion FROM dbo.Auditorias
WHERE Id>@Antes AND Accion=N'TRIGGER_PRECIO';
ROLLBACK TRANSACTION;
```
