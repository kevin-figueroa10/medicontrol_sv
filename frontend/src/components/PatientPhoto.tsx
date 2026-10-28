import {useEffect,useState} from 'react';
import {useClinic,initials,Row} from '../context/Clinic';
import {documentBlob} from '../lib/api';

export default function PatientPhoto({patient,editable=false,compact=false}:{patient:Row;editable?:boolean;compact?:boolean}){
 const {mutate,busy}=useClinic();const [url,setUrl]=useState(''),[error,setError]=useState('');
 useEffect(()=>{setUrl('');setError('');if(!patient.fotoDocumentoId)return;const controller=new AbortController();let objectUrl='';
  documentBlob(patient.fotoDocumentoId,controller.signal).then(blob=>{if(!controller.signal.aborted){objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);}}).catch(()=>{if(!controller.signal.aborted)setError('No se pudo cargar la foto.');});
  return ()=>{controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[patient.fotoDocumentoId,patient.fotoActualizadaUtc]);
 async function upload(file:File){setError('');if(!['image/png','image/jpeg'].includes(file.type)||file.size<=0||file.size>2*1024*1024){setError('Use una foto PNG o JPEG de hasta 2 MB.');return;}
  const data=new FormData();data.append('archivo',file);try{await mutate(`/pacientes/${patient.id}/foto`,data);}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo guardar la foto.');}}
 return <div className="flex-shrink-0 max-w-40"><div className={`${compact?'w-8 h-8 rounded-full text-xs':'w-16 h-16 rounded-2xl text-xl'} bg-blue-600 text-white grid place-items-center font-bold overflow-hidden`}>{url?<img src={url} alt={`Foto de ${patient.nombre}`} className="w-full h-full object-cover"/>:initials(String(patient.nombre))}</div>
 {editable&&<label className="block text-xs text-blue-700 mt-2 cursor-pointer">{patient.fotoDocumentoId?'Cambiar foto':'Agregar foto'}<input disabled={busy} type="file" accept="image/png,image/jpeg" className="block text-xs w-36 mt-1" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value='';}}/></label>}
 {error&&<p role="alert" className="text-xs text-red-700 mt-2">{error}</p>}</div>;
}
