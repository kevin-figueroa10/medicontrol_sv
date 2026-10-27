# MediControl SV — defensa final UDB

## Puntuación según rúbrica
- 25 puntos: ejecución sin errores.
- 25 puntos: interfaz de Fase I y base relacional.
- 25 puntos: claves primarias, foráneas, relaciones y triggers.
- 25 puntos: explicación individual del proyecto.

## Orden seguro de demostración
1. Presentar el problema y los cuatro roles de Fase I.
2. Mostrar la interfaz de Figma conservada en React.
3. Abrir SSMS, ejecutar `database/01_Esquema_Original_FaseI.sql` en una base de pruebas VACÍA.
4. Ejecutar `database/02_Triggers_FaseFinal.sql`.
5. Ejecutar `database/03_Validaciones_Demo.sql` y explicar FK, índices, check constraints y triggers.
6. Mostrar una prueba manual de agenda en un entorno con datos de demostración. Demostrar el rechazo de citas superpuestas.
7. Mostrar inicio de sesión, altas y reportes del backend EF en su BASE DIFERENTE, si ha sido compilado, configurado y probado antes.

## Advertencia de arquitectura
**No ejecutar el script SQL original sobre la misma base usada por `EnsureCreated()` de EF Core.** Son esquemas incompatibles en nomenclatura y mapeos actuales. Para integrar definitivamente ambos caminos hace falta mapear todas las entidades EF a sus tablas/columnas del script, eliminar `EnsureCreated` y adoptar migraciones o scripts versionados. Si quieres demostrar UI conectada a SQL, prioriza la base EF generada y no afirmes que usa el esquema original.

## Preguntas frecuentes
- **PK:** identifica de forma única una fila.
- **FK:** enlaza registros y evita referencias a entidades inexistentes.
- **Índice único:** impide duplicados de campos como documento y horarios exactos.
- **Trigger:** se ejecuta dentro de SQL Server cuando ocurre INSERT/UPDATE/DELETE; `TR_Citas_SinSolapamientos` valida intervalos que el índice de inicio no cubre.
- **CHECK:** valida restricciones de estados, fechas y montos.
- **Autorización:** los endpoints requieren token JWT y roles; ocultar una pantalla no reemplaza el control del servidor.
- **Transacciones:** varias operaciones relacionadas deben confirmarse juntas o revertirse juntas.

## Casos que necesitan validación real antes de presentar
Compilación .NET 10, acceso SQL Server, conexión frontend-backend, autorización por recurso clínico, rechazo de turnos simultáneos bajo concurrencia, roles y expediente, pruebas de carga y restauración desde backup. No usar información clínica real en las demostraciones.
