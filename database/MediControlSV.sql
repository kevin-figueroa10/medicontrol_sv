-- MEDICONTROL SV - ARCHIVO SQL UNICO
-- Modelo de 29 tablas, relaciones, índices, 8 vistas y 4 triggers.
-- Sin contraseñas, usuarios reales, pacientes ni datos clínicos.
-- En SSMS: crear o seleccionar MediControlSV (Azure) o MediControlSV_FaseII (local).
-- No crea bases de pago ni elimina registros o tablas.
-- Puede ejecutarse otra vez: agrega objetos y columnas faltantes.
-- Las vistas y los triggers se actualizan con CREATE OR ALTER.
-- Ejecutar TODO el archivo. No requiere modo SQLCMD ni separadores GO.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
IF DB_NAME() NOT IN(N'MediControlSV',N'MediControlSV_FaseII')
 AND DB_NAME() NOT LIKE N'MediControlSV_Test[_]%'
 THROW 51000,N'Seleccione la base de MediControl antes de ejecutar este archivo.',1;
BEGIN TRY
 BEGIN TRANSACTION;

 -- 1. TABLAS Y CLAVES. Las tablas existentes se conservan.
 IF OBJECT_ID(N'dbo.Auditorias',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Auditorias] (
    [Id] int NOT NULL IDENTITY,
    [UsuarioId] int NULL,
    [Accion] nvarchar(100) NOT NULL,
    [Entidad] nvarchar(100) NOT NULL,
    [EntidadId] int NULL,
    [Descripcion] nvarchar(250) NOT NULL,
    [Ip] nvarchar(64) NOT NULL,
    [FechaUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Auditorias] PRIMARY KEY ([Id])
);');

 IF OBJECT_ID(N'dbo.ConfiguracionesConsultorio',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[ConfiguracionesConsultorio] (
    [Id] int NOT NULL IDENTITY,
    [Correo] nvarchar(200) NOT NULL,
    [Horario] nvarchar(200) NOT NULL,
    [DuracionMinutos] int NOT NULL,
    [AnticipoDias] int NOT NULL,
    [CancelacionHoras] int NOT NULL,
    [PermitirOnline] bit NOT NULL,
    [Nombre] nvarchar(150) NOT NULL,
    [Direccion] nvarchar(300) NOT NULL,
    [Telefono] nvarchar(20) NOT NULL,
    CONSTRAINT [PK_ConfiguracionesConsultorio] PRIMARY KEY ([Id])
);');

 IF OBJECT_ID(N'dbo.Especialidades',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Especialidades] (
    [Id] int NOT NULL IDENTITY,
    [Descripcion] nvarchar(500) NOT NULL,
    [Nombre] nvarchar(120) NOT NULL,
    [Activa] bit NOT NULL,
    CONSTRAINT [PK_Especialidades] PRIMARY KEY ([Id])
);');

 IF OBJECT_ID(N'dbo.Permisos',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Permisos] (
    [Id] int NOT NULL IDENTITY,
    [Codigo] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_Permisos] PRIMARY KEY ([Id])
);');

 IF OBJECT_ID(N'dbo.Roles',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Roles] (
    [Id] int NOT NULL IDENTITY,
    [Nombre] nvarchar(40) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
);');

 IF OBJECT_ID(N'dbo.Servicios',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Servicios] (
    [Id] int NOT NULL IDENTITY,
    [Descripcion] nvarchar(500) NOT NULL,
    [DuracionMinutos] int NOT NULL,
    [Nombre] nvarchar(140) NOT NULL,
    [Precio] decimal(12,2) NOT NULL,
    [Activo] bit NOT NULL,
    CONSTRAINT [PK_Servicios] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Servicios_Precio] CHECK ([Precio] >= 0)
);');

 IF OBJECT_ID(N'dbo.Usuarios',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Usuarios] (
    [Id] int NOT NULL IDENTITY,
    [Nombre] nvarchar(160) NOT NULL,
    [Correo] nvarchar(200) NOT NULL,
    [PasswordHash] nvarchar(255) NOT NULL,
    [Rol] nvarchar(40) NOT NULL,
    [Activo] bit NOT NULL,
    [IntentosFallidos] int NOT NULL,
    [BloqueadoHastaUtc] datetime2 NULL,
    [CreadoUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id])
);');

 IF OBJECT_ID(N'dbo.RolesPermisos',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[RolesPermisos] (
    [RolId] int NOT NULL,
    [PermisoId] int NOT NULL,
    CONSTRAINT [PK_RolesPermisos] PRIMARY KEY ([RolId], [PermisoId]),
    CONSTRAINT [FK_RolesPermisos_Permisos_PermisoId] FOREIGN KEY ([PermisoId]) REFERENCES [dbo].[Permisos] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_RolesPermisos_Roles_RolId] FOREIGN KEY ([RolId]) REFERENCES [dbo].[Roles] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.Medicos',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Medicos] (
    [Id] int NOT NULL IDENTITY,
    [Telefono] nvarchar(20) NOT NULL,
    [Horario] nvarchar(200) NOT NULL,
    [UsuarioId] int NULL,
    [Nombre] nvarchar(160) NOT NULL,
    [Especialidad] nvarchar(100) NOT NULL,
    [Jvpm] nvarchar(50) NOT NULL,
    [Activo] bit NOT NULL,
    CONSTRAINT [PK_Medicos] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Medicos_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [dbo].[Usuarios] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.Notificaciones',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Notificaciones] (
    [Id] int NOT NULL IDENTITY,
    [UsuarioId] int NOT NULL,
    [CitaId] int NULL,
    [Titulo] nvarchar(160) NOT NULL,
    [Mensaje] nvarchar(500) NOT NULL,
    [Leida] bit NOT NULL,
    [FechaUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Notificaciones] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Notificaciones_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [dbo].[Usuarios] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.Pacientes',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Pacientes] (
    [Id] int NOT NULL IDENTITY,
    [Sexo] nvarchar(20) NOT NULL,
    [Direccion] nvarchar(300) NOT NULL,
    [Notas] nvarchar(1500) NOT NULL,
    [UsuarioId] int NULL,
    [Nombre] nvarchar(160) NOT NULL,
    [Documento] nvarchar(30) NOT NULL,
    [FechaNacimiento] date NOT NULL,
    [Telefono] nvarchar(20) NOT NULL,
    [Correo] nvarchar(200) NOT NULL,
    [Activo] bit NOT NULL,
    CONSTRAINT [PK_Pacientes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Pacientes_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [dbo].[Usuarios] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.PreferenciasNotificacion',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[PreferenciasNotificacion] (
    [Id] int NOT NULL IDENTITY,
    [UsuarioId] int NOT NULL,
    [Email] bit NOT NULL,
    [EnSistema] bit NOT NULL,
    CONSTRAINT [PK_PreferenciasNotificacion] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PreferenciasNotificacion_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [dbo].[Usuarios] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.TokensRecuperacion',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[TokensRecuperacion] (
    [Id] int NOT NULL IDENTITY,
    [UsuarioId] int NOT NULL,
    [TokenHash] nvarchar(128) NOT NULL,
    [ExpiraUtc] datetime2 NOT NULL,
    [UsadoUtc] datetime2 NULL,
    CONSTRAINT [PK_TokensRecuperacion] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TokensRecuperacion_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [dbo].[Usuarios] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.BloqueosAgenda',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[BloqueosAgenda] (
    [Id] int NOT NULL IDENTITY,
    [MedicoId] int NOT NULL,
    [Inicio] datetime2 NOT NULL,
    [Fin] datetime2 NOT NULL,
    [Motivo] nvarchar(200) NOT NULL,
    CONSTRAINT [PK_BloqueosAgenda] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_BloqueosAgenda_Medicos_MedicoId] FOREIGN KEY ([MedicoId]) REFERENCES [dbo].[Medicos] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.HorariosMedico',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[HorariosMedico] (
    [Id] int NOT NULL IDENTITY,
    [MedicoId] int NOT NULL,
    [DiaSemana] int NOT NULL,
    [Desde] time NOT NULL,
    [Hasta] time NOT NULL,
    [Activo] bit NOT NULL,
    CONSTRAINT [PK_HorariosMedico] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_HorariosMedico_Medicos_MedicoId] FOREIGN KEY ([MedicoId]) REFERENCES [dbo].[Medicos] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.MedicosEspecialidades',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[MedicosEspecialidades] (
    [MedicoId] int NOT NULL,
    [EspecialidadId] int NOT NULL,
    CONSTRAINT [PK_MedicosEspecialidades] PRIMARY KEY ([MedicoId], [EspecialidadId]),
    CONSTRAINT [FK_MedicosEspecialidades_Especialidades_EspecialidadId] FOREIGN KEY ([EspecialidadId]) REFERENCES [dbo].[Especialidades] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_MedicosEspecialidades_Medicos_MedicoId] FOREIGN KEY ([MedicoId]) REFERENCES [dbo].[Medicos] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.MedicosServicios',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[MedicosServicios] (
    [MedicoId] int NOT NULL,
    [ServicioId] int NOT NULL,
    CONSTRAINT [PK_MedicosServicios] PRIMARY KEY ([MedicoId], [ServicioId]),
    CONSTRAINT [FK_MedicosServicios_Medicos_MedicoId] FOREIGN KEY ([MedicoId]) REFERENCES [dbo].[Medicos] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_MedicosServicios_Servicios_ServicioId] FOREIGN KEY ([ServicioId]) REFERENCES [dbo].[Servicios] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.Citas',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Citas] (
    [Id] int NOT NULL IDENTITY,
    [PrecioAcordado] decimal(12,2) NOT NULL,
    [PacienteId] int NOT NULL,
    [MedicoId] int NOT NULL,
    [ServicioId] int NOT NULL,
    [Inicio] datetime2 NOT NULL,
    [Fin] datetime2 NOT NULL,
    [Estado] nvarchar(30) NOT NULL,
    [Motivo] nvarchar(500) NOT NULL,
    [CreadaUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Citas] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Citas_Rango] CHECK ([Fin] > [Inicio]),
    CONSTRAINT [FK_Citas_Medicos_MedicoId] FOREIGN KEY ([MedicoId]) REFERENCES [dbo].[Medicos] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Citas_Pacientes_PacienteId] FOREIGN KEY ([PacienteId]) REFERENCES [dbo].[Pacientes] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Citas_Servicios_ServicioId] FOREIGN KEY ([ServicioId]) REFERENCES [dbo].[Servicios] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.ContactosEmergencia',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[ContactosEmergencia] (
    [Id] int NOT NULL IDENTITY,
    [PacienteId] int NOT NULL,
    [Nombre] nvarchar(160) NOT NULL,
    [Telefono] nvarchar(20) NOT NULL,
    [Parentesco] nvarchar(70) NOT NULL,
    CONSTRAINT [PK_ContactosEmergencia] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ContactosEmergencia_Pacientes_PacienteId] FOREIGN KEY ([PacienteId]) REFERENCES [dbo].[Pacientes] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.Consultas',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Consultas] (
    [Id] int NOT NULL IDENTITY,
    [CitaId] int NOT NULL,
    [Motivo] nvarchar(2000) NOT NULL,
    [Antecedentes] nvarchar(2000) NOT NULL,
    [Evaluacion] nvarchar(2000) NOT NULL,
    [Diagnostico] nvarchar(2000) NOT NULL,
    [Tratamiento] nvarchar(2000) NOT NULL,
    [Recomendaciones] nvarchar(2000) NOT NULL,
    [Observaciones] nvarchar(2000) NOT NULL,
    [Estado] nvarchar(20) NOT NULL,
    [FechaUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Consultas] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Consultas_Citas_CitaId] FOREIGN KEY ([CitaId]) REFERENCES [dbo].[Citas] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.HistorialCitas',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[HistorialCitas] (
    [Id] int NOT NULL IDENTITY,
    [CitaId] int NOT NULL,
    [UsuarioId] int NULL,
    [EstadoAnterior] nvarchar(30) NOT NULL,
    [EstadoNuevo] nvarchar(30) NOT NULL,
    [FechaUtc] datetime2 NOT NULL,
    [Motivo] nvarchar(200) NOT NULL,
    CONSTRAINT [PK_HistorialCitas] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_HistorialCitas_Citas_CitaId] FOREIGN KEY ([CitaId]) REFERENCES [dbo].[Citas] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.Pagos',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Pagos] (
    [Id] int NOT NULL IDENTITY,
    [CitaId] int NOT NULL,
    [Monto] decimal(12,2) NOT NULL,
    [Metodo] nvarchar(30) NOT NULL,
    [Estado] nvarchar(30) NOT NULL,
    [Referencia] nvarchar(100) NOT NULL,
    [FechaUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Pagos] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Pagos_Monto] CHECK ([Monto] > 0),
    CONSTRAINT [FK_Pagos_Citas_CitaId] FOREIGN KEY ([CitaId]) REFERENCES [dbo].[Citas] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.EstudiosMedicos',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[EstudiosMedicos] (
    [Id] int NOT NULL IDENTITY,
    [ConsultaId] int NOT NULL,
    [Tipo] nvarchar(140) NOT NULL,
    [Indicaciones] nvarchar(1000) NOT NULL,
    [Estado] nvarchar(30) NOT NULL,
    CONSTRAINT [PK_EstudiosMedicos] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_EstudiosMedicos_Consultas_ConsultaId] FOREIGN KEY ([ConsultaId]) REFERENCES [dbo].[Consultas] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.Recetas',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Recetas] (
    [Id] int NOT NULL IDENTITY,
    [ConsultaId] int NOT NULL,
    [MedicoId] int NOT NULL,
    [Indicaciones] nvarchar(1000) NOT NULL,
    [Anulada] bit NOT NULL,
    [FechaUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Recetas] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Recetas_Consultas_ConsultaId] FOREIGN KEY ([ConsultaId]) REFERENCES [dbo].[Consultas] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Recetas_Medicos_MedicoId] FOREIGN KEY ([MedicoId]) REFERENCES [dbo].[Medicos] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.Seguimientos',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[Seguimientos] (
    [Id] int NOT NULL IDENTITY,
    [ConsultaId] int NOT NULL,
    [Fecha] date NOT NULL,
    [Motivo] nvarchar(500) NOT NULL,
    [Indicaciones] nvarchar(1500) NOT NULL,
    [Estado] nvarchar(30) NOT NULL,
    [CitaFuturaId] int NULL,
    CONSTRAINT [PK_Seguimientos] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Seguimientos_Consultas_ConsultaId] FOREIGN KEY ([ConsultaId]) REFERENCES [dbo].[Consultas] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.SignosVitales',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[SignosVitales] (
    [Id] int NOT NULL IDENTITY,
    [ConsultaId] int NOT NULL,
    [Temperatura] decimal(4,1) NULL,
    [FrecuenciaCardiaca] int NULL,
    [PresionSistolica] int NULL,
    [PresionDiastolica] int NULL,
    [Saturacion] int NULL,
    [PesoKg] decimal(6,2) NULL,
    [AlturaCm] decimal(5,1) NULL,
    CONSTRAINT [PK_SignosVitales] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SignosVitales_Consultas_ConsultaId] FOREIGN KEY ([ConsultaId]) REFERENCES [dbo].[Consultas] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.DocumentosPaciente',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[DocumentosPaciente] (
    [Id] int NOT NULL IDENTITY,
    [EstudioMedicoId] int NULL,
    [EsFoto] bit NOT NULL DEFAULT CAST(0 AS bit),
    [PacienteId] int NOT NULL,
    [Nombre] nvarchar(140) NOT NULL,
    [TipoMime] nvarchar(100) NOT NULL,
    [RutaPrivada] nvarchar(500) NOT NULL,
    [UsuarioCargaId] int NULL,
    [FechaUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_DocumentosPaciente] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_DocumentosPaciente_Foto] CHECK ([EsFoto] = 0 OR ([EstudioMedicoId] IS NULL AND [TipoMime] IN (''image/png'',''image/jpeg''))),
    CONSTRAINT [FK_DocumentosPaciente_EstudiosMedicos_EstudioMedicoId] FOREIGN KEY ([EstudioMedicoId]) REFERENCES [dbo].[EstudiosMedicos] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_DocumentosPaciente_Pacientes_PacienteId] FOREIGN KEY ([PacienteId]) REFERENCES [dbo].[Pacientes] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.ResultadosEstudio',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[ResultadosEstudio] (
    [Id] int NOT NULL IDENTITY,
    [Interpretacion] nvarchar(2500) NOT NULL,
    [EstudioMedicoId] int NOT NULL,
    [Descripcion] nvarchar(2500) NOT NULL,
    [FechaUtc] datetime2 NOT NULL,
    [Revisado] bit NOT NULL,
    CONSTRAINT [PK_ResultadosEstudio] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ResultadosEstudio_EstudiosMedicos_EstudioMedicoId] FOREIGN KEY ([EstudioMedicoId]) REFERENCES [dbo].[EstudiosMedicos] ([Id]) ON DELETE NO ACTION
);');

 IF OBJECT_ID(N'dbo.DetallesReceta',N'U') IS NULL
  EXEC(N'CREATE TABLE [dbo].[DetallesReceta] (
    [Id] int NOT NULL IDENTITY,
    [RecetaId] int NOT NULL,
    [Medicamento] nvarchar(160) NOT NULL,
    [Presentacion] nvarchar(100) NOT NULL,
    [Dosis] nvarchar(100) NOT NULL,
    [Frecuencia] nvarchar(100) NOT NULL,
    [Duracion] nvarchar(100) NOT NULL,
    [Indicaciones] nvarchar(500) NOT NULL,
    CONSTRAINT [PK_DetallesReceta] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DetallesReceta_Recetas_RecetaId] FOREIGN KEY ([RecetaId]) REFERENCES [dbo].[Recetas] ([Id]) ON DELETE NO ACTION
);');

 -- 2. ACTUALIZACIONES COMPATIBLES CON BASES EXISTENTES
 EXEC(N'-- Extensión idempotente del esquema de desarrollo, sin eliminar datos.
IF COL_LENGTH(''Pacientes'',''Sexo'') IS NULL ALTER TABLE Pacientes ADD Sexo nvarchar(20) NOT NULL CONSTRAINT DF_Pacientes_Sexo DEFAULT '''';
IF COL_LENGTH(''Pacientes'',''Direccion'') IS NULL ALTER TABLE Pacientes ADD Direccion nvarchar(300) NOT NULL CONSTRAINT DF_Pacientes_Direccion DEFAULT '''';
IF COL_LENGTH(''Pacientes'',''Notas'') IS NULL ALTER TABLE Pacientes ADD Notas nvarchar(1500) NOT NULL CONSTRAINT DF_Pacientes_Notas DEFAULT '''';
IF COL_LENGTH(''Medicos'',''Telefono'') IS NULL ALTER TABLE Medicos ADD Telefono nvarchar(20) NOT NULL CONSTRAINT DF_Medicos_Telefono DEFAULT '''';
IF COL_LENGTH(''Medicos'',''Horario'') IS NULL ALTER TABLE Medicos ADD Horario nvarchar(200) NOT NULL CONSTRAINT DF_Medicos_Horario DEFAULT '''';

IF COL_LENGTH(''Especialidades'',''Descripcion'') IS NULL ALTER TABLE Especialidades ADD Descripcion nvarchar(500) NOT NULL CONSTRAINT DF_Especialidades_Descripcion DEFAULT '''';
IF COL_LENGTH(''Servicios'',''Descripcion'') IS NULL ALTER TABLE Servicios ADD Descripcion nvarchar(500) NOT NULL CONSTRAINT DF_Servicios_Descripcion DEFAULT '''';
IF COL_LENGTH(''Servicios'',''DuracionMinutos'') IS NULL ALTER TABLE Servicios ADD DuracionMinutos int NOT NULL CONSTRAINT DF_Servicios_Duracion DEFAULT 30;
IF COL_LENGTH(''ConfiguracionesConsultorio'',''Correo'') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD Correo nvarchar(200) NOT NULL CONSTRAINT DF_Config_Correo DEFAULT '''';
IF COL_LENGTH(''ConfiguracionesConsultorio'',''Horario'') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD Horario nvarchar(200) NOT NULL CONSTRAINT DF_Config_Horario DEFAULT '''';
IF COL_LENGTH(''ConfiguracionesConsultorio'',''DuracionMinutos'') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD DuracionMinutos int NOT NULL CONSTRAINT DF_Config_Duracion DEFAULT 30;
IF COL_LENGTH(''ConfiguracionesConsultorio'',''AnticipoDias'') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD AnticipoDias int NOT NULL CONSTRAINT DF_Config_Anticipo DEFAULT 60;
IF COL_LENGTH(''ConfiguracionesConsultorio'',''CancelacionHoras'') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD CancelacionHoras int NOT NULL CONSTRAINT DF_Config_Cancelacion DEFAULT 24;
IF COL_LENGTH(''ConfiguracionesConsultorio'',''PermitirOnline'') IS NULL ALTER TABLE ConfiguracionesConsultorio ADD PermitirOnline bit NOT NULL CONSTRAINT DF_Config_Online DEFAULT 1;

IF COL_LENGTH(''Citas'',''PrecioAcordado'') IS NULL
BEGIN
 ALTER TABLE Citas ADD PrecioAcordado decimal(12,2) NOT NULL CONSTRAINT DF_Citas_Precio DEFAULT 0;
 EXEC(''UPDATE c SET PrecioAcordado=s.Precio FROM Citas c INNER JOIN Servicios s ON s.Id=c.ServicioId'');
END;
');
 EXEC(N'
 IF COL_LENGTH(N''dbo.DocumentosPaciente'',N''EstudioMedicoId'') IS NULL
  EXEC(N''ALTER TABLE dbo.DocumentosPaciente ADD EstudioMedicoId int NULL;'');
 IF COL_LENGTH(N''dbo.DocumentosPaciente'',N''EsFoto'') IS NULL
  EXEC(N''ALTER TABLE dbo.DocumentosPaciente ADD EsFoto bit NOT NULL CONSTRAINT DF_DocumentosPaciente_EsFoto DEFAULT(0) WITH VALUES;'');
 IF NOT EXISTS(SELECT 1 FROM sys.foreign_keys WHERE name=N''FK_DocumentosPaciente_EstudiosMedicos_EstudioMedicoId'')
  EXEC(N''ALTER TABLE dbo.DocumentosPaciente WITH CHECK ADD CONSTRAINT FK_DocumentosPaciente_EstudiosMedicos_EstudioMedicoId FOREIGN KEY(EstudioMedicoId) REFERENCES dbo.EstudiosMedicos(Id);'');
 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N''dbo.DocumentosPaciente'') AND name=N''IX_DocumentosPaciente_EstudioMedicoId'')
  EXEC(N''CREATE INDEX IX_DocumentosPaciente_EstudioMedicoId ON dbo.DocumentosPaciente(EstudioMedicoId);'');
 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N''dbo.DocumentosPaciente'') AND name=N''IX_DocumentosPaciente_FotoUnica'')
  EXEC(N''CREATE UNIQUE INDEX IX_DocumentosPaciente_FotoUnica ON dbo.DocumentosPaciente(PacienteId) WHERE EsFoto=1;'');
 IF NOT EXISTS(SELECT 1 FROM sys.check_constraints WHERE name=N''CK_DocumentosPaciente_Foto'')
  EXEC(N''ALTER TABLE dbo.DocumentosPaciente WITH CHECK ADD CONSTRAINT CK_DocumentosPaciente_Foto CHECK(EsFoto=0 OR (EstudioMedicoId IS NULL AND TipoMime IN (''''image/png'''',''''image/jpeg'''')));'');
 IF COL_LENGTH(N''dbo.ResultadosEstudio'',N''Interpretacion'') IS NULL
  EXEC(N''ALTER TABLE dbo.ResultadosEstudio ADD Interpretacion nvarchar(2500) NOT NULL CONSTRAINT DF_ResultadosEstudio_Interpretacion DEFAULT(N'''''''') WITH VALUES;'');
 IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE Nombre=N''Laboratorio'')
  INSERT INTO dbo.Roles(Nombre) VALUES(N''Laboratorio'');
 ');

 -- 3. INDICES DEL MODELO
 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.BloqueosAgenda') AND name=N'IX_BloqueosAgenda_MedicoId')
  EXEC(N'CREATE INDEX [IX_BloqueosAgenda_MedicoId] ON [dbo].[BloqueosAgenda] ([MedicoId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Citas') AND name=N'IX_Citas_MedicoId_Inicio_Fin')
  EXEC(N'CREATE INDEX [IX_Citas_MedicoId_Inicio_Fin] ON [dbo].[Citas] ([MedicoId], [Inicio], [Fin]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Citas') AND name=N'IX_Citas_PacienteId_Inicio')
  EXEC(N'CREATE INDEX [IX_Citas_PacienteId_Inicio] ON [dbo].[Citas] ([PacienteId], [Inicio]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Citas') AND name=N'IX_Citas_ServicioId')
  EXEC(N'CREATE INDEX [IX_Citas_ServicioId] ON [dbo].[Citas] ([ServicioId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Consultas') AND name=N'IX_Consultas_CitaId')
  EXEC(N'CREATE UNIQUE INDEX [IX_Consultas_CitaId] ON [dbo].[Consultas] ([CitaId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.ContactosEmergencia') AND name=N'IX_ContactosEmergencia_PacienteId')
  EXEC(N'CREATE INDEX [IX_ContactosEmergencia_PacienteId] ON [dbo].[ContactosEmergencia] ([PacienteId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.DetallesReceta') AND name=N'IX_DetallesReceta_RecetaId')
  EXEC(N'CREATE INDEX [IX_DetallesReceta_RecetaId] ON [dbo].[DetallesReceta] ([RecetaId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.DocumentosPaciente') AND name=N'IX_DocumentosPaciente_EstudioMedicoId')
  EXEC(N'CREATE INDEX [IX_DocumentosPaciente_EstudioMedicoId] ON [dbo].[DocumentosPaciente] ([EstudioMedicoId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.DocumentosPaciente') AND name=N'IX_DocumentosPaciente_FotoUnica')
  EXEC(N'CREATE UNIQUE INDEX [IX_DocumentosPaciente_FotoUnica] ON [dbo].[DocumentosPaciente] ([PacienteId]) WHERE [EsFoto] = 1;');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.EstudiosMedicos') AND name=N'IX_EstudiosMedicos_ConsultaId')
  EXEC(N'CREATE INDEX [IX_EstudiosMedicos_ConsultaId] ON [dbo].[EstudiosMedicos] ([ConsultaId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.HistorialCitas') AND name=N'IX_HistorialCitas_CitaId')
  EXEC(N'CREATE INDEX [IX_HistorialCitas_CitaId] ON [dbo].[HistorialCitas] ([CitaId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.HorariosMedico') AND name=N'IX_HorariosMedico_MedicoId')
  EXEC(N'CREATE INDEX [IX_HorariosMedico_MedicoId] ON [dbo].[HorariosMedico] ([MedicoId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Medicos') AND name=N'IX_Medicos_Jvpm')
  EXEC(N'CREATE UNIQUE INDEX [IX_Medicos_Jvpm] ON [dbo].[Medicos] ([Jvpm]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Medicos') AND name=N'IX_Medicos_UsuarioId')
  EXEC(N'CREATE UNIQUE INDEX [IX_Medicos_UsuarioId] ON [dbo].[Medicos] ([UsuarioId]) WHERE [UsuarioId] IS NOT NULL;');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.MedicosEspecialidades') AND name=N'IX_MedicosEspecialidades_EspecialidadId')
  EXEC(N'CREATE INDEX [IX_MedicosEspecialidades_EspecialidadId] ON [dbo].[MedicosEspecialidades] ([EspecialidadId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.MedicosServicios') AND name=N'IX_MedicosServicios_ServicioId')
  EXEC(N'CREATE INDEX [IX_MedicosServicios_ServicioId] ON [dbo].[MedicosServicios] ([ServicioId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Notificaciones') AND name=N'IX_Notificaciones_UsuarioId')
  EXEC(N'CREATE INDEX [IX_Notificaciones_UsuarioId] ON [dbo].[Notificaciones] ([UsuarioId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Pacientes') AND name=N'IX_Pacientes_Documento')
  EXEC(N'CREATE UNIQUE INDEX [IX_Pacientes_Documento] ON [dbo].[Pacientes] ([Documento]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Pacientes') AND name=N'IX_Pacientes_UsuarioId')
  EXEC(N'CREATE UNIQUE INDEX [IX_Pacientes_UsuarioId] ON [dbo].[Pacientes] ([UsuarioId]) WHERE [UsuarioId] IS NOT NULL;');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Pagos') AND name=N'IX_Pagos_CitaId')
  EXEC(N'CREATE INDEX [IX_Pagos_CitaId] ON [dbo].[Pagos] ([CitaId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Permisos') AND name=N'IX_Permisos_Codigo')
  EXEC(N'CREATE UNIQUE INDEX [IX_Permisos_Codigo] ON [dbo].[Permisos] ([Codigo]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.PreferenciasNotificacion') AND name=N'IX_PreferenciasNotificacion_UsuarioId')
  EXEC(N'CREATE UNIQUE INDEX [IX_PreferenciasNotificacion_UsuarioId] ON [dbo].[PreferenciasNotificacion] ([UsuarioId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Recetas') AND name=N'IX_Recetas_ConsultaId')
  EXEC(N'CREATE INDEX [IX_Recetas_ConsultaId] ON [dbo].[Recetas] ([ConsultaId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Recetas') AND name=N'IX_Recetas_MedicoId')
  EXEC(N'CREATE INDEX [IX_Recetas_MedicoId] ON [dbo].[Recetas] ([MedicoId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.ResultadosEstudio') AND name=N'IX_ResultadosEstudio_EstudioMedicoId')
  EXEC(N'CREATE UNIQUE INDEX [IX_ResultadosEstudio_EstudioMedicoId] ON [dbo].[ResultadosEstudio] ([EstudioMedicoId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Roles') AND name=N'IX_Roles_Nombre')
  EXEC(N'CREATE UNIQUE INDEX [IX_Roles_Nombre] ON [dbo].[Roles] ([Nombre]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.RolesPermisos') AND name=N'IX_RolesPermisos_PermisoId')
  EXEC(N'CREATE INDEX [IX_RolesPermisos_PermisoId] ON [dbo].[RolesPermisos] ([PermisoId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Seguimientos') AND name=N'IX_Seguimientos_ConsultaId')
  EXEC(N'CREATE INDEX [IX_Seguimientos_ConsultaId] ON [dbo].[Seguimientos] ([ConsultaId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.SignosVitales') AND name=N'IX_SignosVitales_ConsultaId')
  EXEC(N'CREATE INDEX [IX_SignosVitales_ConsultaId] ON [dbo].[SignosVitales] ([ConsultaId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.TokensRecuperacion') AND name=N'IX_TokensRecuperacion_UsuarioId')
  EXEC(N'CREATE INDEX [IX_TokensRecuperacion_UsuarioId] ON [dbo].[TokensRecuperacion] ([UsuarioId]);');

 IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.Usuarios') AND name=N'IX_Usuarios_Correo')
  EXEC(N'CREATE UNIQUE INDEX [IX_Usuarios_Correo] ON [dbo].[Usuarios] ([Correo]);');

 -- 4. CATALOGO DE ROLES. No crea cuentas ni contraseñas.
 IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE Nombre=N'Administrador') INSERT INTO dbo.Roles(Nombre) VALUES(N'Administrador');
 IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE Nombre=N'Recepcionista') INSERT INTO dbo.Roles(Nombre) VALUES(N'Recepcionista');
 IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE Nombre=N'Medico') INSERT INTO dbo.Roles(Nombre) VALUES(N'Medico');
 IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE Nombre=N'Paciente') INSERT INTO dbo.Roles(Nombre) VALUES(N'Paciente');
 IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE Nombre=N'Laboratorio') INSERT INTO dbo.Roles(Nombre) VALUES(N'Laboratorio');

 -- 5. VISTAS Y TRIGGERS DE AUDITORIA
 EXEC(N'CREATE OR ALTER VIEW dbo.vw_UsuariosPublicos
AS
SELECT Id AS UsuarioId, Nombre, Correo, Rol, Activo,
       IntentosFallidos, BloqueadoHastaUtc, CreadoUtc
FROM dbo.Usuarios;');

 EXEC(N'CREATE OR ALTER VIEW dbo.vw_PacientesResumen
AS
SELECT p.Id AS PacienteId, p.Nombre, p.Documento, p.FechaNacimiento,
       p.Telefono, p.Correo, p.Activo,
       (SELECT COUNT_BIG(*) FROM dbo.Citas c WHERE c.PacienteId=p.Id) AS TotalCitas,
       (SELECT MAX(co.FechaUtc) FROM dbo.Consultas co
        INNER JOIN dbo.Citas c ON c.Id=co.CitaId WHERE c.PacienteId=p.Id) AS UltimaConsultaUtc
FROM dbo.Pacientes p;');

 EXEC(N'CREATE OR ALTER VIEW dbo.vw_MedicosHorarios
AS
SELECT m.Id AS MedicoId, m.Nombre AS Medico, m.Especialidad, m.Jvpm,
       m.Telefono, m.Activo AS MedicoActivo, u.Activo AS CuentaActiva,
       h.DiaSemana,
       CASE h.DiaSemana WHEN 0 THEN N''Domingo'' WHEN 1 THEN N''Lunes''
            WHEN 2 THEN N''Martes'' WHEN 3 THEN N''Miércoles'' WHEN 4 THEN N''Jueves''
            WHEN 5 THEN N''Viernes'' WHEN 6 THEN N''Sábado'' END AS DiaAtencion,
       h.Desde, h.Hasta
FROM dbo.Medicos m
LEFT JOIN dbo.Usuarios u ON u.Id=m.UsuarioId
LEFT JOIN dbo.HorariosMedico h ON h.MedicoId=m.Id AND h.Activo=1;');

 EXEC(N'CREATE OR ALTER VIEW dbo.vw_CitasDetalle
AS
SELECT c.Id AS CitaId, c.PacienteId, p.Nombre AS Paciente,
       c.MedicoId, m.Nombre AS Medico, m.Especialidad,
       c.ServicioId, s.Nombre AS Servicio, c.PrecioAcordado,
       c.Inicio AS Fecha, c.Fin, DATEADD(HOUR,-6,c.Inicio) AS FechaLocal,
       c.Estado, c.Motivo,
       CASE WHEN c.Estado IN(N''Confirmada'',N''En espera'')
                 AND CONVERT(date,DATEADD(HOUR,-6,c.Inicio))
                     < CONVERT(date,DATEADD(HOUR,-6,SYSUTCDATETIME()))
            THEN N''No atendida'' ELSE c.Estado END AS EstadoMostrado
FROM dbo.Citas c
INNER JOIN dbo.Pacientes p ON p.Id=c.PacienteId
INNER JOIN dbo.Medicos m ON m.Id=c.MedicoId
INNER JOIN dbo.Servicios s ON s.Id=c.ServicioId;');

 EXEC(N'CREATE OR ALTER VIEW dbo.vw_ConsultasDetalle
AS
SELECT co.Id AS ConsultaId, co.CitaId, c.PacienteId, p.Nombre AS Paciente,
       c.MedicoId, m.Nombre AS Medico, co.FechaUtc, co.Motivo,
       co.Diagnostico, co.Tratamiento, co.Recomendaciones,
       co.Estado AS EstadoConsulta,
       sv.Temperatura, sv.FrecuenciaCardiaca, sv.PresionSistolica,
       sv.PresionDiastolica, sv.Saturacion, sv.PesoKg, sv.AlturaCm
FROM dbo.Consultas co
INNER JOIN dbo.Citas c ON c.Id=co.CitaId
INNER JOIN dbo.Pacientes p ON p.Id=c.PacienteId
INNER JOIN dbo.Medicos m ON m.Id=c.MedicoId
OUTER APPLY (SELECT TOP(1) v.* FROM dbo.SignosVitales v
             WHERE v.ConsultaId=co.Id ORDER BY v.Id DESC) sv;');

 EXEC(N'CREATE OR ALTER VIEW dbo.vw_SaldosCitas
AS
WITH Cobros AS (
 SELECT CitaId, SUM(Monto) AS TotalPagado
 FROM dbo.Pagos WHERE Estado=N''Pagado'' GROUP BY CitaId
)
SELECT c.Id AS CitaId, c.PacienteId, p.Nombre AS Paciente,
       c.MedicoId, m.Nombre AS Medico, s.Nombre AS Servicio,
       c.Inicio AS Fecha, c.Estado AS EstadoCita, c.PrecioAcordado,
       ISNULL(cb.TotalPagado,0) AS TotalPagado,
       CASE WHEN c.Estado IN(N''Cancelada'',N''No asistió'') THEN 0
            WHEN c.PrecioAcordado>ISNULL(cb.TotalPagado,0)
            THEN c.PrecioAcordado-ISNULL(cb.TotalPagado,0) ELSE 0 END AS SaldoPendiente,
       CASE WHEN c.Estado IN(N''Cancelada'',N''No asistió'') THEN N''No aplica''
            WHEN c.PrecioAcordado=0 THEN N''Sin costo''
            WHEN ISNULL(cb.TotalPagado,0)>=c.PrecioAcordado THEN N''Pagado''
            WHEN ISNULL(cb.TotalPagado,0)=0 THEN N''Sin pagar''
            ELSE N''Pago parcial'' END AS EstadoPago
FROM dbo.Citas c
INNER JOIN dbo.Pacientes p ON p.Id=c.PacienteId
INNER JOIN dbo.Medicos m ON m.Id=c.MedicoId
INNER JOIN dbo.Servicios s ON s.Id=c.ServicioId
LEFT JOIN Cobros cb ON cb.CitaId=c.Id;');

 EXEC(N'CREATE OR ALTER VIEW dbo.vw_PagosDetalle
AS
SELECT pg.Id AS PagoId, pg.CitaId, c.PacienteId, p.Nombre AS Paciente,
       c.MedicoId, m.Nombre AS Medico, s.Nombre AS Servicio,
       pg.Monto, pg.Metodo, pg.Estado, pg.Referencia, pg.FechaUtc
FROM dbo.Pagos pg
INNER JOIN dbo.Citas c ON c.Id=pg.CitaId
INNER JOIN dbo.Pacientes p ON p.Id=c.PacienteId
INNER JOIN dbo.Medicos m ON m.Id=c.MedicoId
INNER JOIN dbo.Servicios s ON s.Id=c.ServicioId;');

 EXEC(N'CREATE OR ALTER VIEW dbo.vw_EstudiosResultados
AS
SELECT e.Id AS EstudioId, e.ConsultaId, c.PacienteId, p.Nombre AS Paciente,
       c.MedicoId, m.Nombre AS Medico, e.Tipo, e.Indicaciones,
       e.Estado AS EstadoEstudio, r.Id AS ResultadoId, r.Descripcion AS Resultado,
       r.Interpretacion, ISNULL(r.Revisado,0) AS Revisado, r.FechaUtc AS FechaResultadoUtc,
       (SELECT COUNT_BIG(*) FROM dbo.DocumentosPaciente d
        WHERE d.EstudioMedicoId=e.Id AND d.EsFoto=0) AS ArchivosAdjuntos
FROM dbo.EstudiosMedicos e
INNER JOIN dbo.Consultas co ON co.Id=e.ConsultaId
INNER JOIN dbo.Citas c ON c.Id=co.CitaId
INNER JOIN dbo.Pacientes p ON p.Id=c.PacienteId
INNER JOIN dbo.Medicos m ON m.Id=c.MedicoId
LEFT JOIN dbo.ResultadosEstudio r ON r.EstudioMedicoId=e.Id;');

 EXEC(N'CREATE OR ALTER TRIGGER dbo.trg_Usuarios_CambioEstado
ON dbo.Usuarios AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT INTO dbo.Auditorias(UsuarioId,Accion,Entidad,EntidadId,Descripcion,Ip,FechaUtc)
 SELECT NULL,N''TRIGGER_ESTADO'',N''Usuario'',i.Id,
 CONCAT(N''Estado anterior: '',d.Activo,N''. Estado nuevo: '',i.Activo),N'''',SYSUTCDATETIME()
 FROM inserted i INNER JOIN deleted d ON d.Id=i.Id WHERE i.Activo<>d.Activo;
END;');

 EXEC(N'CREATE OR ALTER TRIGGER dbo.trg_Servicios_CambioPrecio
ON dbo.Servicios AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT INTO dbo.Auditorias(UsuarioId,Accion,Entidad,EntidadId,Descripcion,Ip,FechaUtc)
 SELECT NULL,N''TRIGGER_PRECIO'',N''Servicio'',i.Id,
 CONCAT(N''Precio anterior: '',d.Precio,N''. Precio nuevo: '',i.Precio),N'''',SYSUTCDATETIME()
 FROM inserted i INNER JOIN deleted d ON d.Id=i.Id WHERE i.Precio<>d.Precio;
END;');

 EXEC(N'CREATE OR ALTER TRIGGER dbo.trg_Pagos_Registro
ON dbo.Pagos AFTER INSERT AS
BEGIN
 SET NOCOUNT ON;
 INSERT INTO dbo.Auditorias(UsuarioId,Accion,Entidad,EntidadId,Descripcion,Ip,FechaUtc)
 SELECT NULL,N''TRIGGER_PAGO'',N''Pago'',i.Id,
 CONCAT(N''Cita '',i.CitaId,N''. Monto: '',i.Monto,N''. Método: '',i.Metodo),N'''',SYSUTCDATETIME()
 FROM inserted i;
END;');

 EXEC(N'CREATE OR ALTER TRIGGER dbo.trg_Pacientes_CambioTelefono
ON dbo.Pacientes AFTER UPDATE AS
BEGIN
 SET NOCOUNT ON;
 INSERT INTO dbo.Auditorias(UsuarioId,Accion,Entidad,EntidadId,Descripcion,Ip,FechaUtc)
 SELECT NULL,N''TRIGGER_CONTACTO'',N''Paciente'',i.Id,
 N''Se modificó el teléfono del paciente.'',N'''',SYSUTCDATETIME()
 FROM inserted i INNER JOIN deleted d ON d.Id=i.Id
 WHERE ISNULL(i.Telefono,N'''')<>ISNULL(d.Telefono,N'''');
END;');

 COMMIT TRANSACTION;
END TRY
BEGIN CATCH
 IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
 THROW;
END CATCH;

-- COMPROBACION DE INSTALACION
SELECT DB_NAME() AS BaseActual,N'Estructura de MediControl preparada correctamente' AS Resultado;
SELECT name AS Tabla FROM sys.tables WHERE schema_id=SCHEMA_ID(N'dbo') ORDER BY name;
SELECT name AS Vista FROM sys.views WHERE schema_id=SCHEMA_ID(N'dbo') AND name LIKE N'vw[_]%' ORDER BY name;
SELECT OBJECT_NAME(parent_id) AS Tabla,name AS NombreTrigger,is_disabled AS Deshabilitado
FROM sys.triggers WHERE parent_class=1 AND name LIKE N'trg[_]%' ORDER BY Tabla,NombreTrigger;
