import {useState} from 'react';
import {useClinic,date,day,Row} from '../context/Clinic';
import {appointmentStatus} from '../lib/appointmentStatus';
import {Modal,Field} from './ClinicalUI';
import {ActionForm} from './ManageForms';

export default function UnattendedAppointments(){
 const {panel,session,mutate}=useClinic();const [selected,setSelected]=useState<Row>();
 const [inicio,setInicio]=useState(''),[motivo,setMotivo]=useState('');
 if(!['Administrador','Recepcionista'].includes(session.rol))return null;
 const pending=panel.appointments.filter(a=>appointmentStatus({estado:a.estado,inicio:a.inicio})==='No atendida'||a.estado==='No asistió');
 if(!pending.length)return null;
 return <section className="card p-4 mb-5 border border-orange-200">
 <h2 className="font-semibold text-orange-800">Citas sin atender o con ausencia ({pending.length})</h2>
 <p className="text-sm text-slate-500 mb-3">Las citas de días anteriores confirmadas o en espera se identifican como no atendidas. Recepción puede acordar un nuevo horario.</p>
 <div className="max-h-80 overflow-auto space-y-2">{pending.map(a=><div key={a.id} className="flex flex-wrap gap-3 items-center justify-between border-t border-slate-100 py-3">
 <div><strong className="text-sm">{a.paciente}</strong><p className="text-xs text-slate-500">{date(a.inicio,true)} · {a.medico} · {a.servicio}</p><span className="text-xs text-orange-700">{appointmentStatus({estado:a.estado,inicio:a.inicio})}</span></div>
 <button className="btn btn-secondary btn-sm" onClick={()=>{setSelected(a);setInicio('');setMotivo('');}}>Reprogramar</button>
 </div>)}</div>
 {selected&&<Modal title="Reprogramar cita" onClose={()=>setSelected(undefined)}><ActionForm label="Confirmar nuevo horario" onClose={()=>setSelected(undefined)} onSave={async()=>{
  const start=new Date(inicio),duration=new Date(selected.fin).valueOf()-new Date(selected.inicio).valueOf();
  if(!Number.isFinite(start.valueOf())||start<=new Date())throw new Error('Seleccione una fecha y hora futuras.');
  if(!motivo.trim())throw new Error('Indique el motivo de la reprogramación.');
  await mutate(`/citas/${selected.id}/horario`,{inicio:start.toISOString(),fin:new Date(start.valueOf()+duration).toISOString(),motivo:motivo.trim()},'PUT');
 }}><p className="text-sm">{selected.paciente} · {selected.medico}. Se conserva la duración y cualquier abono de la cita.</p>
 <Field label="Nueva fecha y hora"><input className="input-field" type="datetime-local" required min={`${day()}T00:00`} value={inicio} onChange={e=>setInicio(e.target.value)}/></Field>
 <Field label="Motivo"><textarea className="input-field" required maxLength={200} value={motivo} onChange={e=>setMotivo(e.target.value)}/></Field>
 <p className="text-xs text-slate-500">Se validarán la jornada del médico, cruces de citas y bloqueos antes de guardar.</p>
 </ActionForm></Modal>}
 </section>;
}
