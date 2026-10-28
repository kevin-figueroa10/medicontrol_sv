import {useState} from 'react';
import {useClinic,Row} from '../context/Clinic';
import {ActionForm} from './ManageForms';
export default function StudyInterpretation({study,onClose}:{study:Row;onClose:()=>void}){
 const {session,mutate}=useClinic();const [text,setText]=useState(String(study.resultado?.interpretacion||''));
 return <section className="mt-4"><h3 className="font-semibold text-sm mb-2">Interpretación médica</h3>
 {study.resultado?.interpretacion&&<p className="text-sm whitespace-pre-wrap bg-blue-50 rounded-lg p-3 mb-3">{study.resultado.interpretacion}</p>}
 {session.rol==='Medico'&&!study.resultado?.revisado?<ActionForm onClose={onClose} label="Guardar interpretación" onSave={async()=>{await mutate(`/estudios/${study.id}/interpretacion`,{descripcion:text},'PUT');}}><textarea className="input-field" aria-label="Interpretación médica" required maxLength={2500} value={text} onChange={e=>setText(e.target.value)}/></ActionForm>:!study.resultado?.interpretacion&&<p className="text-sm text-slate-500">El médico aún no ha registrado una interpretación.</p>}
 </section>;
}
