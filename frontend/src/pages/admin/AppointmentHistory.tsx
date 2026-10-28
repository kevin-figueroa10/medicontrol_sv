import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useClinic,date,Row} from '../../context/Clinic';
import {appointmentStatus,clinicDay} from '../../lib/appointmentStatus';
import {RescheduleModal} from '../../components/UnattendedAppointments';

export default function AppointmentHistory(){
 const {panel,session,reload,mutate}=useClinic();
 const [search,setSearch]=useState(''),[period,setPeriod]=useState('Anteriores'),[status,setStatus]=useState('Todos');
 const [from,setFrom]=useState(''),[to,setTo]=useState(''),[selected,setSelected]=useState<Row>();
 useEffect(()=>{reload().catch(()=>{});},[reload]);
 const today=clinicDay(new Date());
 const appointments=panel.appointments.filter(a=>{
  const day=clinicDay(a.inicio),state=appointmentStatus({estado:a.estado,inicio:a.inicio});
  return (period==='Todas'||(period==='Anteriores'?day<today:day===today))&&(!from||day>=from)&&(!to||day<=to)&&
   (status==='Todos'||state===status)&&`${a.paciente} ${a.medico} ${a.servicio} ${a.id}`.toLowerCase().includes(search.trim().toLowerCase());
 }).sort((a,b)=>new Date(b.inicio).valueOf()-new Date(a.inicio).valueOf());
 async function update(a:Row,state:string){if(!window.confirm(`¿Cambiar la cita de ${a.paciente} a ${state}?`))return;try{await mutate(`/citas/${a.id}/estado?estado=${encodeURIComponent(state)}`,undefined,'PATCH');}catch{}}
 return <div className="p-6 max-w-screen-xl">
 <div className="flex flex-wrap gap-3 justify-between mb-5"><div><h1 className="text-xl font-bold text-slate-900">Historial de citas</h1><p className="text-sm text-slate-500">{session.rol==='Medico'?'Solo sus citas y pacientes asignados.':'Consulte las citas de todos los médicos.'} Fechas de El Salvador.</p></div><button className="btn btn-secondary btn-sm" onClick={()=>reload().catch(()=>{})}>Actualizar</button></div>
 <div className="card p-4 mb-4 flex flex-wrap gap-3">
 <input className="input-field flex-1 min-w-48" aria-label="Buscar cita" placeholder="Paciente, médico, servicio o número de cita" value={search} onChange={e=>setSearch(e.target.value)}/>
 <select className="input-field w-auto" aria-label="Período" value={period} onChange={e=>setPeriod(e.target.value)}>{['Anteriores','Hoy','Todas'].map(s=><option key={s}>{s}</option>)}</select>
 <select className="input-field w-auto" aria-label="Estado de cita" value={status} onChange={e=>setStatus(e.target.value)}>{['Todos','No atendida','No asistió','Finalizada','En consulta','En espera','Confirmada','Cancelada'].map(s=><option key={s}>{s}</option>)}</select>
 <label className="text-xs text-slate-500">Desde<input type="date" className="input-field" value={from} max={to||undefined} onChange={e=>setFrom(e.target.value)}/></label>
 <label className="text-xs text-slate-500">Hasta<input type="date" className="input-field" value={to} min={from||undefined} onChange={e=>setTo(e.target.value)}/></label>
 </div>
 <p className="text-sm text-slate-500 mb-3">{appointments.length} citas encontradas</p>
 <div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr>{['Cita / fecha','Paciente','Médico / servicio','Estado','Acciones'].map(h=><th key={h} className="text-left p-4">{h}</th>)}</tr></thead><tbody>
 {!appointments.length&&<tr><td colSpan={5} className="p-8 text-center text-slate-500">No hay citas para los filtros seleccionados.</td></tr>}
 {appointments.map(a=>{
  const state=appointmentStatus({estado:a.estado,inicio:a.inicio});
  const hasConsultation=panel.consultations.some(c=>c.citaId===a.id);
  const canReschedule=!hasConsultation&&(['Confirmada','No asistió'].includes(a.estado)||state==='No atendida');
  return <tr key={a.id} className="border-t border-slate-100"><td className="p-4">#{a.id}<p className="text-xs text-slate-500">{date(a.inicio,true)}</p></td><td className="p-4">{a.paciente}</td><td className="p-4">{a.medico}<p className="text-xs text-slate-500">{a.servicio}</p></td><td className="p-4"><span className={`badge ${state==='No atendida'||state==='No asistió'?'bg-orange-100 text-orange-800':state==='Finalizada'?'bg-green-100 text-green-700':'bg-slate-100 text-slate-700'}`}>{state}</span></td>
  <td className="p-4"><div className="flex flex-wrap gap-2">
  <Link className="btn btn-ghost btn-sm" to={`/admin/patients/record?id=${a.pacienteId}`}>Ver expediente</Link>
  {canReschedule&&<button className="btn btn-secondary btn-sm" onClick={()=>setSelected(a)}>Reprogramar</button>}
  {session.rol==='Medico'&&a.estado==='En consulta'&&<Link className="btn btn-primary btn-sm" to={`/doctor/consultation?cita=${a.id}`}>Continuar consulta</Link>}
  {session.rol!=='Medico'&&state==='No atendida'&&<button className="btn btn-ghost btn-sm" onClick={()=>update(a,'No asistió')}>Marcar ausencia</button>}
  </div></td></tr>;
 })}
 </tbody></table></div>
 {selected&&<RescheduleModal appointment={selected} onClose={()=>setSelected(undefined)}/>}
 </div>;
}
