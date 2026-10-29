-- Seleccionar MediControlSV. Esperar el despliegue compatible de la API antes de probar escrituras.
CREATE OR ALTER TRIGGER dbo.trg_Usuarios_CambioEstado
ON dbo.Usuarios AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT INTO dbo.Auditorias(UsuarioId,Accion,Entidad,EntidadId,Descripcion,Ip,FechaUtc)
 SELECT NULL,N'TRIGGER_ESTADO',N'Usuario',i.Id,
 CONCAT(N'Estado anterior: ',d.Activo,N'. Estado nuevo: ',i.Activo),N'',SYSUTCDATETIME()
 FROM inserted i INNER JOIN deleted d ON d.Id=i.Id WHERE i.Activo<>d.Activo;
END;
GO
CREATE OR ALTER TRIGGER dbo.trg_Servicios_CambioPrecio
ON dbo.Servicios AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT INTO dbo.Auditorias(UsuarioId,Accion,Entidad,EntidadId,Descripcion,Ip,FechaUtc)
 SELECT NULL,N'TRIGGER_PRECIO',N'Servicio',i.Id,
 CONCAT(N'Precio anterior: ',d.Precio,N'. Precio nuevo: ',i.Precio),N'',SYSUTCDATETIME()
 FROM inserted i INNER JOIN deleted d ON d.Id=i.Id WHERE i.Precio<>d.Precio;
END;
GO
CREATE OR ALTER TRIGGER dbo.trg_Pagos_Registro
ON dbo.Pagos AFTER INSERT AS
BEGIN
 SET NOCOUNT ON;
 INSERT INTO dbo.Auditorias(UsuarioId,Accion,Entidad,EntidadId,Descripcion,Ip,FechaUtc)
 SELECT NULL,N'TRIGGER_PAGO',N'Pago',i.Id,
 CONCAT(N'Cita ',i.CitaId,N'. Monto: ',i.Monto,N'. Método: ',i.Metodo),N'',SYSUTCDATETIME()
 FROM inserted i;
END;
GO
CREATE OR ALTER TRIGGER dbo.trg_Pacientes_CambioTelefono
ON dbo.Pacientes AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT INTO dbo.Auditorias(UsuarioId,Accion,Entidad,EntidadId,Descripcion,Ip,FechaUtc)
 SELECT NULL,N'TRIGGER_CONTACTO',N'Paciente',i.Id,
 N'Se modificó el teléfono del paciente.',N'',SYSUTCDATETIME()
 FROM inserted i INNER JOIN deleted d ON d.Id=i.Id
 WHERE ISNULL(i.Telefono,N'')<>ISNULL(d.Telefono,N'');
END;
GO
