-- MediControl: laboratorio, archivos de estudios y foto del paciente.
-- Ejecutar en Azure SQL: MediControlSV. No elimina tablas ni datos.
SET XACT_ABORT ON;
IF DB_NAME() NOT IN (N'MediControlSV',N'MediControlSV_FaseII') AND DB_NAME() NOT LIKE N'MediControlSV_Test[_]%'
 THROW 51000, N'Seleccione la base MediControlSV antes de ejecutar.', 1;
IF OBJECT_ID(N'dbo.DocumentosPaciente',N'U') IS NULL OR OBJECT_ID(N'dbo.EstudiosMedicos',N'U') IS NULL
 THROW 51001, N'Faltan las tablas originales. Este archivo es una actualización, no la base completa.', 1;
BEGIN TRY
 BEGIN TRANSACTION;
 IF COL_LENGTH(N'dbo.DocumentosPaciente',N'EstudioMedicoId') IS NULL
  EXEC(N'ALTER TABLE dbo.DocumentosPaciente ADD EstudioMedicoId int NULL;');
 IF COL_LENGTH(N'dbo.DocumentosPaciente',N'EsFoto') IS NULL
  EXEC(N'ALTER TABLE dbo.DocumentosPaciente ADD EsFoto bit NOT NULL CONSTRAINT DF_DocumentosPaciente_EsFoto DEFAULT(0) WITH VALUES;');
 IF NOT EXISTS(SELECT 1 FROM sys.foreign_keys WHERE name=N'FK_DocumentosPaciente_EstudiosMedicos_EstudioMedicoId')
  EXEC(N'ALTER TABLE dbo.DocumentosPaciente WITH CHECK ADD CONSTRAINT FK_DocumentosPaciente_EstudiosMedicos_EstudioMedicoId FOREIGN KEY(EstudioMedicoId) REFERENCES dbo.EstudiosMedicos(Id);');
 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.DocumentosPaciente') AND name=N'IX_DocumentosPaciente_EstudioMedicoId')
  EXEC(N'CREATE INDEX IX_DocumentosPaciente_EstudioMedicoId ON dbo.DocumentosPaciente(EstudioMedicoId);');
 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.DocumentosPaciente') AND name=N'IX_DocumentosPaciente_FotoUnica')
  EXEC(N'CREATE UNIQUE INDEX IX_DocumentosPaciente_FotoUnica ON dbo.DocumentosPaciente(PacienteId) WHERE EsFoto=1;');
 IF NOT EXISTS(SELECT 1 FROM sys.check_constraints WHERE name=N'CK_DocumentosPaciente_Foto')
  EXEC(N'ALTER TABLE dbo.DocumentosPaciente WITH CHECK ADD CONSTRAINT CK_DocumentosPaciente_Foto CHECK(EsFoto=0 OR (EstudioMedicoId IS NULL AND TipoMime IN (''image/png'',''image/jpeg'')));');
 IF COL_LENGTH(N'dbo.ResultadosEstudio',N'Interpretacion') IS NULL
  EXEC(N'ALTER TABLE dbo.ResultadosEstudio ADD Interpretacion nvarchar(2500) NOT NULL CONSTRAINT DF_ResultadosEstudio_Interpretacion DEFAULT(N'''') WITH VALUES;');
 IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE Nombre=N'Laboratorio')
  INSERT INTO dbo.Roles(Nombre) VALUES(N'Laboratorio');
 COMMIT TRANSACTION;
 SELECT DB_NAME() AS BaseActual, N'Actualización de laboratorio y fotos completada' AS Resultado;
 SELECT name AS Columna FROM sys.columns WHERE object_id=OBJECT_ID(N'dbo.DocumentosPaciente') AND name IN(N'EstudioMedicoId',N'EsFoto');
END TRY
BEGIN CATCH
 IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
 THROW;
END CATCH;