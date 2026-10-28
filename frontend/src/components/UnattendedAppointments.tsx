import {useState} from 'react';
import {useClinic,date,day,Row} from '../context/Clinic';
import {appointmentStatus} from '../lib/appointmentStatus';
import {Modal,Field} from './ClinicalUI';
import {ActionForm} from './ManageForms';
import {useDoctorSlots} from '../lib/useDoctorSlots';
import {clinicStart} from '../lib/doctorSlots';

export default function UnattendedAppointments(){
 const {panel,session}=useClinic();const [selected,setSelected]=useState<Row>();
 if(!['Administrador','Recepcionista','Medico'].includes(session.rol))return null;
 const pending=panel.appointments.filter(a=>appointmentStatus({estado:a.estado,inicio:a.inicio})==='No atendida'||a.estado==='No asistió');
 if(!pending.length)return null;
 return <section className="card p-4 mb-5 border border-orange-200">
 <h2 className="font-semibold text-orange-800">Citas sin atender o con ausencia ({pending.length})</h2>
 <p className="text-sm text-slate-500 mb-3">Las citas de días anteriores confirmadas o en espera se identifican como no atendidas. Puede acordar un nuevo horario según sus permisos.</p>
 <div className="max-h-80 overflow-auto space-y-2">{pending.map(a=><div key={a.id} className="flex flex-wrap gap-3 items-center justify-between border-t border-slate-100 py-3">
 <div><strong className="text-sm">{a.paciente}</strong><p className="text-xs text-slate-500">{date(a.inicio,true)} · {a.medico} · {a.servicio}</p><span className="text-xs text-orange-700">{appointmentStatus({estado:a.estado,inicio:a.inicio})}</span></div>
 <button className="btn btn-secondary btn-sm" onClick={()=>setSelected(a)}>Reprogramar</button>
 </div>)}</div>
 {selected&&<RescheduleModal appointment={selected} onClose={()=>setSelected(undefined)}/>}
 </section>;
}

export function RescheduleModal({appointment:selected,onClose}:{appointment:Row;onClose:()=>void}){
 const {mutate,panel}=useClinic();
 const [specialty,setSpecialty]=useState(String(selected.especialidad||panel.doctors.find(d=>d.id===selected.medicoId)?.especialidad||''));
 const [doctorId,setDoctorId]=useState(String(selected.medicoId)),[date,setDate]=useState(''),[time,setTime]=useState(''),[motivo,setMotivo]=useState('');
 const doctors=panel.doctors.filter(d=>d.activo),specialties=[...new Set(doctors.map(d=>String(d.especialidad)))];
 const chosenDoctor=doctors.find(d=>d.id===Number(doctorId)&&d.especialidad===specialty);
 const duration=(new Date(selected.fin).valueOf()-new Date(selected.inicio).valueOf())/60000;
 const availability=useDoctorSlots(chosenDoctor?.id,date,duration,panel.appointments,selected.pacienteId,selected.id);
 return <Modal title="Reprogramar cita" onClose={onClose}><ActionForm label="Confirmar nuevo horario" onClose={onClose} onSave={async()=>{
  if(!chosenDoctor||!availability.slots.some(s=>s.time===time&&s.available))throw new Error('Seleccione médico, fecha y un horario disponible.');
  const start=clinicStart(date,time);
  if(!Number.isFinite(start.valueOf())||start<=new Date())throw new Error('Seleccione una fecha y hora futuras.');
  if(!motivo.trim())throw new Error('Indique el motivo de la reprogramación.');
  await mutate(`/citas/${selected.id}/horario`,{inicio:start.toISOString(),fin:new Date(start.valueOf()+duration*60000).toISOString(),motivo:motivo.trim(),medicoId:chosenDoctor.id},'PUT');
 }}><p className="text-sm">{selected.paciente} · Médico actual: {selected.medico}. Se conserva el servicio, su precio, la duración ({duration} minutos) y cualquier abono de la cita.</p>
 <Field label="Especialidad"><select required className="input-field" value={specialty} onChange={e=>{setSpecialty(e.target.value);setDoctorId('');setTime('');}}><option value="">Seleccionar especialidad…</option>{specialties.map(s=><option key={s}>{s}</option>)}</select></Field>
 <Field label="Médico"><select required className="input-field" value={doctorId} onChange={e=>{setDoctorId(e.target.value);setTime('');}}><option value="">Seleccionar médico…</option>{doctors.filter(d=>d.especialidad===specialty).map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}</select></Field>
 {chosenDoctor&&<p className="text-xs text-blue-700">Jornada semanal: {(chosenDoctor.horarios as Row[]||[]).map(h=>`${['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][h.diaSemana]} ${String(h.desde).slice(0,5)}–${String(h.hasta).slice(0,5)}`).join(' · ')||'Sin horarios configurados'}</p>}
 <Field label="Nueva fecha"><input className="input-field" type="date" required min={day()} max={day(new Date(Date.now()+Number(panel.clinic?.anticipoDias||60)*86400000).toISOString())} value={date} onChange={e=>{setDate(e.target.value);setTime('');}}/></Field>
 {availability.loading&&<p role="status" className="text-sm text-slate-500">Consultando horarios del médico…</p>}
 {availability.error&&<p role="alert" className="text-red-700 text-sm">{availability.error} <button type="button" className="underline" onClick={availability.retry}>Reintentar</button></p>}
 {date&&chosenDoctor&&!availability.loading&&!availability.error&&<><p className="text-xs text-slate-500">Hora de El Salvador. {availability.ranges.map(h=>`${h.desde.slice(0,5)} a ${h.hasta.slice(0,5)}`).join(' · ')||'El médico no atiende este día.'}</p>
 <div className="grid grid-cols-4 gap-2">{availability.slots.map(s=><button type="button" key={s.time} disabled={!s.available} onClick={()=>setTime(s.time)} className={`btn btn-sm ${time===s.time?'btn-primary':'btn-secondary'} ${!s.available?'opacity-40 line-through':''}`}>{s.time}</button>)}</div>
 {!availability.slots.some(s=>s.available)&&<p className="text-sm text-orange-700">No hay horarios disponibles para esta fecha y duración. Elija otro día o médico.</p>}</>}
 <Field label="Motivo"><textarea className="input-field" required maxLength={200} value={motivo} onChange={e=>setMotivo(e.target.value)}/></Field>
 <p className="text-xs text-slate-500">Se validarán la jornada del médico, cruces de citas y bloqueos antes de guardar.</p>
 </ActionForm></Modal>;
}
