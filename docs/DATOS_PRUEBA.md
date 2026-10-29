# Datos ficticios opcionales

El SQL principal contiene estructura y roles; no incluye pacientes, usuarios o contraseñas.

Para practicar en la base local `MediControlSV_FaseII` existe `scripts/SeedDemo`. Solo funciona en localhost y agrega un lote identificado por `PRUEBA-MCSV`, con correos de `prueba.invalid`. Requiere una cuenta administradora activa y genera una contraseña aleatoria; no se almacena una contraseña universal en el repositorio.

```powershell
dotnet run --project scripts/SeedDemo
```

El lote incorpora pacientes, médicos, servicios, citas, consultas, recetas, estudios, seguimientos y pagos ficticios. Si el lote ya existe, no lo duplica. No se trata de una migración de producción ni de cobros bancarios reales.
