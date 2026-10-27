USE MediControlSV;
GO
-- Protege la agenda ante solapamientos parciales o totales; el índice de hora inicial no basta.
CREATE OR ALTER TRIGGER dbo.TR_Citas_SinSolapamientos
ON dbo.Citas AFTER INSERT, UPDATE
AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS (
    SELECT 1 FROM inserted i
    JOIN dbo.Citas c WITH (UPDLOCK, HOLDLOCK)
      ON c.id_medico=i.id_medico AND c.id_cita<>i.id_cita
     AND c.fecha_hora_inicio<i.fecha_hora_fin
     AND i.fecha_hora_inicio<c.fecha_hora_fin
    WHERE i.estado NOT IN (N'Cancelada',N'No asistio')
      AND c.estado NOT IN (N'Cancelada',N'No asistio')
 )
 BEGIN
   THROW 51001, N'El medico ya tiene una cita en el intervalo seleccionado.', 1;
 END
END;
GO
-- Registro automático de cambios de estado y de reprogramaciones.
-- Se usa el usuario de creación por defecto; la aplicación debe fijar SESSION_CONTEXT('id_usuario')
-- para atribuir correctamente modificaciones hechas por otro usuario.
CREATE OR ALTER TRIGGER dbo.TR_Citas_Historial
ON dbo.Citas AFTER INSERT, UPDATE
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @actor INT=TRY_CONVERT(INT,SESSION_CONTEXT(N'id_usuario'));
 INSERT INTO dbo.Historial_Citas
 (id_cita,id_usuario,tipo_evento,estado_anterior,estado_nuevo,fecha_hora_anterior,fecha_hora_nueva,descripcion)
 SELECT i.id_cita, COALESCE(@actor,i.id_usuario_creacion),
 CASE WHEN d.id_cita IS NULL THEN N'Creacion'
      WHEN i.estado=N'Cancelada' AND d.estado<>N'Cancelada' THEN N'Cancelacion'
      WHEN i.fecha_hora_inicio<>d.fecha_hora_inicio OR i.fecha_hora_fin<>d.fecha_hora_fin THEN N'Reprogramacion'
      WHEN i.estado=N'Confirmada' THEN N'Confirmacion'
      WHEN i.estado=N'En espera' THEN N'Llegada'
      WHEN i.estado=N'En consulta' THEN N'Inicio consulta'
      WHEN i.estado=N'Finalizada' THEN N'Finalizacion'
      WHEN i.estado=N'No asistio' THEN N'No asistio'
      ELSE N'Otro' END,
 d.estado,i.estado,d.fecha_hora_inicio,i.fecha_hora_inicio,
 N'Registro automatico de cambios de cita'
 FROM inserted i LEFT JOIN deleted d ON d.id_cita=i.id_cita
 WHERE d.id_cita IS NULL OR i.estado<>d.estado
    OR i.fecha_hora_inicio<>d.fecha_hora_inicio OR i.fecha_hora_fin<>d.fecha_hora_fin;
END;
GO
-- La auditoría es de solo inserción para usuarios ordinarios de la aplicación.
-- Los administradores de SQL Server conservan la posibilidad de mantenimiento.
CREATE OR ALTER TRIGGER dbo.TR_Auditoria_NoModificar
ON dbo.Auditoria AFTER UPDATE, DELETE
AS
BEGIN
 SET NOCOUNT ON;
 THROW 51003, N'El historial de auditoria no se puede modificar ni borrar.', 1;
END;
GO
