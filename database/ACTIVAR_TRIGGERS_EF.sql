USE [MediControlSV_FaseII];
GO
CREATE OR ALTER TRIGGER dbo.TR_Citas_NoSuperposicion ON dbo.Citas AFTER INSERT, UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS (SELECT 1 FROM inserted a JOIN dbo.Citas b WITH(UPDLOCK,HOLDLOCK) ON a.MedicoId=b.MedicoId AND a.Id<>b.Id AND a.Inicio<b.Fin AND b.Inicio<a.Fin WHERE a.Estado<>N'Cancelada' AND b.Estado<>N'Cancelada')
 BEGIN THROW 51001,N'El médico tiene una cita superpuesta.',1; END;
END;
GO
CREATE OR ALTER TRIGGER dbo.TR_Pagos_NoNegativos ON dbo.Pagos AFTER INSERT,UPDATE AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM inserted WHERE Monto<=0) BEGIN THROW 51002,N'El pago debe ser positivo.',1; END;
END;
GO
