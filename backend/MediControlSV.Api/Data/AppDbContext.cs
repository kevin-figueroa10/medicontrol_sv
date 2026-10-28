using MediControlSV.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace MediControlSV.Api.Data;
public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options) {
 public DbSet<Rol> Roles=>Set<Rol>(); public DbSet<Permiso> Permisos=>Set<Permiso>(); public DbSet<RolPermiso> RolesPermisos=>Set<RolPermiso>();
 public DbSet<Usuario> Usuarios=>Set<Usuario>(); public DbSet<TokenRecuperacion> TokensRecuperacion=>Set<TokenRecuperacion>(); public DbSet<ConfiguracionConsultorio> ConfiguracionesConsultorio=>Set<ConfiguracionConsultorio>();
 public DbSet<PreferenciaNotificacion> PreferenciasNotificacion=>Set<PreferenciaNotificacion>(); public DbSet<Notificacion> Notificaciones=>Set<Notificacion>(); public DbSet<Auditoria> Auditorias=>Set<Auditoria>();
 public DbSet<Paciente> Pacientes=>Set<Paciente>(); public DbSet<ContactoEmergencia> ContactosEmergencia=>Set<ContactoEmergencia>(); public DbSet<Medico> Medicos=>Set<Medico>(); public DbSet<Especialidad> Especialidades=>Set<Especialidad>();
 public DbSet<MedicoEspecialidad> MedicosEspecialidades=>Set<MedicoEspecialidad>(); public DbSet<Servicio> Servicios=>Set<Servicio>(); public DbSet<MedicoServicio> MedicosServicios=>Set<MedicoServicio>();
 public DbSet<HorarioMedico> HorariosMedico=>Set<HorarioMedico>(); public DbSet<BloqueoAgenda> BloqueosAgenda=>Set<BloqueoAgenda>(); public DbSet<Cita> Citas=>Set<Cita>(); public DbSet<HistorialCita> HistorialCitas=>Set<HistorialCita>(); public DbSet<Pago> Pagos=>Set<Pago>();
 public DbSet<Consulta> Consultas=>Set<Consulta>(); public DbSet<SignosVitales> SignosVitales=>Set<SignosVitales>(); public DbSet<Receta> Recetas=>Set<Receta>(); public DbSet<DetalleReceta> DetallesReceta=>Set<DetalleReceta>();
 public DbSet<EstudioMedico> EstudiosMedicos=>Set<EstudioMedico>(); public DbSet<ResultadoEstudio> ResultadosEstudio=>Set<ResultadoEstudio>(); public DbSet<Seguimiento> Seguimientos=>Set<Seguimiento>(); public DbSet<DocumentoPaciente> DocumentosPaciente=>Set<DocumentoPaciente>();
 protected override void ConfigureConventions(ModelConfigurationBuilder builder) {
  builder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
 }
 protected override void OnModelCreating(ModelBuilder b) {
  b.Entity<Rol>().HasIndex(x=>x.Nombre).IsUnique(); b.Entity<Permiso>().HasIndex(x=>x.Codigo).IsUnique(); b.Entity<RolPermiso>().HasKey(x=>new{x.RolId,x.PermisoId});
  b.Entity<Usuario>().HasIndex(x=>x.Correo).IsUnique(); b.Entity<Paciente>().HasIndex(x=>x.Documento).IsUnique();
  b.Entity<Paciente>().HasIndex(x=>x.UsuarioId).IsUnique().HasFilter("[UsuarioId] IS NOT NULL");
  b.Entity<Medico>().HasIndex(x=>x.Jvpm).IsUnique(); b.Entity<Medico>().HasIndex(x=>x.UsuarioId).IsUnique().HasFilter("[UsuarioId] IS NOT NULL");
  b.Entity<MedicoEspecialidad>().HasKey(x=>new{x.MedicoId,x.EspecialidadId}); b.Entity<MedicoServicio>().HasKey(x=>new{x.MedicoId,x.ServicioId});
  b.Entity<Cita>().HasIndex(x=>new{x.MedicoId,x.Inicio,x.Fin}); b.Entity<Cita>().HasIndex(x=>new{x.PacienteId,x.Inicio}); b.Entity<Consulta>().HasIndex(x=>x.CitaId).IsUnique();
  b.Entity<ResultadoEstudio>().HasIndex(x=>x.EstudioMedicoId).IsUnique(); b.Entity<PreferenciaNotificacion>().HasIndex(x=>x.UsuarioId).IsUnique();
  b.Entity<DocumentoPaciente>().Property(x=>x.EsFoto).HasDefaultValue(false);
  b.Entity<DocumentoPaciente>().HasIndex(x=>x.EstudioMedicoId);
  b.Entity<DocumentoPaciente>().HasIndex(x=>x.PacienteId).IsUnique().HasFilter("[EsFoto] = 1").HasDatabaseName("IX_DocumentosPaciente_FotoUnica");
  b.Entity<DocumentoPaciente>().ToTable(t=>t.HasCheckConstraint("CK_DocumentosPaciente_Foto", "[EsFoto] = 0 OR ([EstudioMedicoId] IS NULL AND [TipoMime] IN ('image/png','image/jpeg'))"));
  b.Entity<Cita>().Property(x=>x.PrecioAcordado).HasPrecision(12,2);
  b.Entity<Servicio>().Property(x=>x.Precio).HasPrecision(12,2); b.Entity<Pago>().Property(x=>x.Monto).HasPrecision(12,2);
  b.Entity<SignosVitales>().Property(x=>x.Temperatura).HasPrecision(4,1); b.Entity<SignosVitales>().Property(x=>x.PesoKg).HasPrecision(6,2); b.Entity<SignosVitales>().Property(x=>x.AlturaCm).HasPrecision(5,1);
  b.Entity<Cita>().ToTable(t=>t.HasCheckConstraint("CK_Citas_Rango", "[Fin] > [Inicio]"));
  b.Entity<Pago>().ToTable(t=>t.HasCheckConstraint("CK_Pagos_Monto", "[Monto] > 0"));
  b.Entity<Servicio>().ToTable(t=>t.HasCheckConstraint("CK_Servicios_Precio", "[Precio] >= 0"));
  foreach(var fk in b.Model.GetEntityTypes().SelectMany(e=>e.GetForeignKeys())) fk.DeleteBehavior=DeleteBehavior.Restrict;
 }
}

public sealed class UtcDateTimeConverter():Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime,DateTime>(v=>v.Kind==DateTimeKind.Unspecified?DateTime.SpecifyKind(v,DateTimeKind.Utc):v.ToUniversalTime(),v=>DateTime.SpecifyKind(v,DateTimeKind.Utc));
