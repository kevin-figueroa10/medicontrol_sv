import {useState} from 'react';
import {useClinic,date,Row} from '../context/Clinic';
import {downloadDocument} from '../lib/api';
import {ActionForm} from './ManageForms';

export default function StudyFiles({study,onClose}:{study:Row;onClose:()=>void}){
 const {session,mutate}=useClinic();const [file,setFile]=useState<File|null>(null),[error,setError]=useState('');
 const canUpload=['Administrador','Medico','Laboratorio'].includes(session.rol)&&study.estado!=='Revisado';
 return <section className="my-4 border-t border-slate-200 pt-4"><h3 className="font-semibold text-sm mb-2">Archivos del estudio</h3>
 {(study.archivos as Row[]||[]).map(d=><div key={d.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 mb-2"><div><p className="text-sm break-all">{d.nombre}</p><p className="text-xs text-slate-500">{date(d.fechaUtc)}</p></div><button className="btn btn-secondary btn-sm" onClick={async()=>{setError('');try{await downloadDocument(d.id,d.nombre);}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo descargar.');}}}>Descargar</button></div>)}
 {!study.archivos?.length&&<p className="text-sm text-slate-500 mb-3">No hay archivos adjuntos.</p>}
 {error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
 {canUpload&&<ActionForm label="Subir resultado" onClose={onClose} onSave={async()=>{
  if(!file)throw new Error('Seleccione un PDF, PNG o JPEG.');
  if(file.size<=0||file.size>5*1024*1024)throw new Error('El archivo debe pesar como máximo 5 MB.');
  if(!['application/pdf','image/png','image/jpeg'].includes(file.type))throw new Error('Use PDF, PNG o JPEG.');
  const data=new FormData();data.append('archivo',file);await mutate(`/estudios/${study.id}/archivos`,data);
 }}><label className="block text-sm">Adjuntar resultado<input className="input-field mt-2" type="file" accept="application/pdf,image/png,image/jpeg" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><p className="text-xs text-slate-500">PDF, PNG o JPEG · Máximo 5 MB por archivo y 10 archivos por estudio. El contenido se valida en el servidor.</p></ActionForm>}
 </section>;
}
