-- Extensión idempotente del esquema de desarrollo, sin eliminar datos.
IF COL_LENGTH('Pacientes','Sexo') IS NULL ALTER TABLE Pacientes ADD Sexo nvarchar(20) NOT NULL CONSTRAINT DF_Pacientes_Sexo DEFAULT '';
IF COL_LENGTH('Pacientes','Direccion') IS NULL ALTER TABLE Pacientes ADD Direccion nvarchar(300) NOT NULL CONSTRAINT DF_Pacientes_Direccion DEFAULT '';
IF COL_LENGTH('Pacientes','Notas') IS NULL ALTER TABLE Pacientes ADD Notas nvarchar(1500) NOT NULL CONSTRAINT DF_Pacientes_Notas DEFAULT '';
IF COL_LENGTH('Medicos','Telefono') IS NULL ALTER TABLE Medicos ADD Telefono nvarchar(20) NOT NULL CONSTRAINT DF_Medicos_Telefono DEFAULT '';
IF COL_LENGTH('Medicos','Horario') IS NULL ALTER TABLE Medicos ADD Horario nvarchar(200) NOT NULL CONSTRAINT DF_Medicos_Horario DEFAULT '';

IF COL_LENGTH('Especialidades','Descripcion') IS NULL ALTER TABLE Especialidades ADD Descripcion nvarchar(500) NOT NULL CONSTRAINT DF_Especialidades_Descripcion DEFAULT '';
IF COL_LENGTH('Servicios','Descripcion') IS NULL ALTER TABLE Servicios ADD Descripcion nvarchar(500) NOT NULL CONSTRAINT DF_Servicios_Descripcion DEFAULT '';
IF COL_LENGTH('Servicios','DuracionMinutos') IS NULL ALTER TABLE Servicios ADD DuracionMinutos int NOT NULL CONSTRAINT DF_Servicios_Duracion DEFAULT 30;
IF COL_LENGTH('ConfiguracionesConsultorio','Correo') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD Correo nvarchar(200) NOT NULL CONSTRAINT DF_Config_Correo DEFAULT '';
IF COL_LENGTH('ConfiguracionesConsultorio','Horario') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD Horario nvarchar(200) NOT NULL CONSTRAINT DF_Config_Horario DEFAULT '';
IF COL_LENGTH('ConfiguracionesConsultorio','DuracionMinutos') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD DuracionMinutos int NOT NULL CONSTRAINT DF_Config_Duracion DEFAULT 30;
IF COL_LENGTH('ConfiguracionesConsultorio','AnticipoDias') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD AnticipoDias int NOT NULL CONSTRAINT DF_Config_Anticipo DEFAULT 60;
IF COL_LENGTH('ConfiguracionesConsultorio','CancelacionHoras') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD CancelacionHoras int NOT NULL CONSTRAINT DF_Config_Cancelacion DEFAULT 24;
IF COL_LENGTH('ConfiguracionesConsultorio','PermitirOnline') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD PermitirOnline bit NOT NULL CONSTRAINT DF_Config_Online DEFAULT 1;

IF COL_LENGTH('Citas','PrecioAcordado') IS NULL
BEGIN
 ALTER TABLE Citas ADD PrecioAcordado decimal(12,2) NOT NULL CONSTRAINT DF_Citas_Precio DEFAULT 0;
 EXEC('UPDATE c SET PrecioAcordado=s.Precio FROM Citas c INNER JOIN Servicios s ON s.Id=c.ServicioId');
END;
