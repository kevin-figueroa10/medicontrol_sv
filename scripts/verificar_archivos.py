from pathlib import Path
p=Path(__file__).resolve().parents[1]
required=['README.md','frontend/package.json','frontend/src/App.tsx','frontend/src/pages/Login.tsx','backend/MediControlSV.Api/Program.cs','backend/MediControlSV.Api/Data/AppDbContext.cs','database/MediControlSV.sql','docs/DESPLIEGUE.md','docs/DEFENSA.md','docs/ALMACENAMIENTO.md']
for f in required:
 path=p/f
 assert path.is_file() and path.stat().st_size>0, f'Falta: {f}'
 print('OK',f)
sql_files=list((p/'database').glob('*.sql'))
assert [f.name for f in sql_files]==['MediControlSV.sql'], 'Debe existir un solo SQL en database.'
sql=sql_files[0].read_text(encoding='utf-8-sig')
assert sql.count('CREATE TABLE [dbo].[')==29, 'El SQL debe incluir las 29 tablas.'
assert sql.count('CREATE OR ALTER VIEW dbo.')==8, 'El SQL debe incluir 8 vistas.'
assert sql.count('CREATE OR ALTER TRIGGER dbo.')==4, 'El SQL debe incluir 4 triggers.'
assert 'DROP TABLE' not in sql.upper(), 'No se permite borrar tablas.'
print('Archivos estructurales y SQL único: OK (no sustituye las pruebas de integración).')
