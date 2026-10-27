# Datos de prueba

El lote `PRUEBA-MCSV` se añadió a SQL Server por solicitud del usuario. Conserva los registros que ya existían y marca los registros ficticios con `(PRUEBA)`, documentos `PRUEBA-MCSV-*` y correos del dominio reservado `prueba.invalid`.

Incluye 18 pacientes, 4 médicos, 4 especialidades, 4 servicios, 38 citas, 14 consultas con signos vitales, 14 recetas, 7 estudios, 14 seguimientos y 17 pagos ficticios. Hay citas de meses anteriores, del día de carga y de los seis días siguientes, con distintos estados para explorar los módulos. Los textos clínicos y recetas indican que no tienen validez médica; los pagos no realizan cobros.

Cuentas creadas:

| Rol | Correo |
|---|---|
| Médico | medico1@prueba.invalid |
| Médico | medico2@prueba.invalid |
| Médico | medico3@prueba.invalid |
| Médico | medico4@prueba.invalid |
| Recepcionista | recepcion@prueba.invalid |
| Paciente | paciente1@prueba.invalid |
| Paciente | paciente2@prueba.invalid |
| Paciente | paciente3@prueba.invalid |

La contraseña aleatoria se entregó en el chat y no se escribe en este archivo. La cuenta administradora conserva sus credenciales.

Para volver a ejecutar el cargador desde la raíz:

```powershell
dotnet build scripts/SeedDemo/SeedDemo.csproj -o .checks/demo-seed
dotnet .checks/demo-seed/SeedDemo.dll
```

Solo admite la base `MediControlSV_FaseII` de SQL Server local. Usa una transacción; si encuentra documentos del lote, no vuelve a insertar ni cambia sus datos o contraseñas. No elimina registros y no habilita carga automática al iniciar la app.
