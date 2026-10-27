USE MediControlSV;
GO
-- Verificaciones de catálogo, integridad, claves y triggers
SELECT t.name AS Tabla, COUNT(c.column_id) AS Columnas FROM sys.tables t JOIN sys.columns c ON c.object_id=t.object_id GROUP BY t.name ORDER BY t.name;
SELECT fk.name AS FK, OBJECT_NAME(fk.parent_object_id) AS Tabla FROM sys.foreign_keys fk ORDER BY Tabla;
SELECT name AS TriggerSQL, OBJECT_NAME(parent_id) AS Tabla FROM sys.triggers ORDER BY Tabla;
SELECT name AS Restriccion FROM sys.check_constraints ORDER BY name;
SELECT name AS Indice, OBJECT_NAME(object_id) AS Tabla FROM sys.indexes WHERE is_unique=1 AND index_id>0 ORDER BY Tabla;
GO
