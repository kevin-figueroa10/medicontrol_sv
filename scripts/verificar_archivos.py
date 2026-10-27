from pathlib import Path
p=Path(__file__).resolve().parents[1]
required=['frontend/package.json','frontend/src/App.tsx','frontend/src/pages/Login.tsx','backend/MediControlSV.Api/Program.cs','backend/MediControlSV.Api/Data/AppDbContext.cs','database/REFERENCIA_NO_EJECUTAR_Esquema_FaseI.sql','database/ACTIVAR_TRIGGERS_EF.sql']
for f in required:
 path=p/f
 assert path.is_file() and path.stat().st_size>0, f'Falta: {f}'
 print('OK',f)
print('Archivos estructurales: OK (no sustituye compilar ni ejecutar pruebas de integración).')
