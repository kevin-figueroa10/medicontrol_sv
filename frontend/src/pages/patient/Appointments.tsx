import {useEffect} from 'react';
import {useClinic,date,day,Row} from '../../context/Clinic';
import {api} from '../../lib/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, X, RefreshCw, Check, CheckCircle, ChevronRight } from 'lucide-react';


const statusBadge: Record<string, string> = {
  'Confirmada': 'bg-blue-100 text-blue-700',
  'Solicitada': 'bg-slate-100 text-slate-600',
  'Finalizada': 'bg-green-100 text-green-700',
  'Cancelada': 'bg-red-100 text-red-700',
  'No asistió': 'bg-orange-100 text-orange-700',
};

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'];


export default function PatientAppointments() {
  const navigate = useNavigate();
  const {panel,mutate,busy}=useClinic();const [error,setError]=useState('');
  const appts=panel.appointments.map(a=>({id:a.id,doctor:String(a.medico),specialty:String(a.especialidad),date:new Date(a.inicio).toLocaleDateString('es-SV',{day:'2-digit',month:'short',year:'numeric'}),time:new Date(a.inicio).toLocaleTimeString('es-SV',{hour:'2-digit',minute:'2-digit'}),status:String(a.estado),group:a.estado==='Cancelada'?'cancelled':new Date(a.inicio)>new Date()&&!['Finalizada','No asistió'].includes(a.estado)?'upcoming':'past'}));
  const [availability,setAvailability]=useState<{ocupados:Row[];bloqueados:Row[];horarios:Row[]}|null>(null);

  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelDone, setCancelDone] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleDone, setRescheduleDone] = useState(false);

  const filtered = appts.filter(a => a.group === tab);

  const confirmCancel = async()=>{setError('');try{await mutate(`/citas/${cancelId}/estado?estado=Cancelada`,undefined,'PATCH');setCancelDone(true);}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo cancelar.');}};
  const closeCancel = () => { setCancelId(null); setCancelDone(false); };

  const current=panel.appointments.find(a=>a.id===rescheduleId);
  useEffect(()=>{setAvailability(null);if(!current||!newDate)return;api<{ocupados:Row[];bloqueados:Row[];horarios:Row[]}>(`/medicos/${current.medicoId}/disponibilidad?fecha=${newDate}`).then(setAvailability).catch(()=>setError('No se pudo consultar la disponibilidad.'));},[current?.id,newDate]);
  const bookedSlots=timeSlots.filter(t=>{const d=new Date(newDate+'T'+t),end=new Date(d.valueOf()+(current?new Date(current.fin).valueOf()-new Date(current.inicio).valueOf():1800000));return !availability||(availability.horarios.length>0&&!availability.horarios.some(h=>h.diaSemana===d.getDay()&&t>=String(h.desde).slice(0,5)&&new Date(end).toTimeString().slice(0,5)<=String(h.hasta).slice(0,5)))||d<new Date()||[...availability.ocupados,...availability.bloqueados].some(a=>new Date(a.inicio)<end&&new Date(a.fin)>d);});
  const confirmReschedule=async()=>{setError('');if(!current||!newDate||!newTime)return;try{const start=new Date(newDate+'T'+newTime),duration=new Date(current.fin).valueOf()-new Date(current.inicio).valueOf();await mutate(`/citas/${current.id}/horario`,{inicio:start.toISOString(),fin:new Date(start.valueOf()+duration).toISOString(),motivo:'Reprogramación solicitada por el paciente'},'PUT');setRescheduleDone(true);}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo reprogramar.');}};
  const closeReschedule = () => { setRescheduleId(null); setNewDate(''); setNewTime(''); setRescheduleDone(false); };

  return (
    <div className="p-6 max-w-screen-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mis citas</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/patient/book')}>
          <Calendar size={13} />
          Agendar cita
        </button>
      </div>

      <div className="flex gap-1 mb-5">
        {[
          { key: 'upcoming', label: 'Próximas' },
          { key: 'past', label: 'Anteriores' },
          { key: 'cancelled', label: 'Canceladas' },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key as any)}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
          <div className="text-slate-500 text-sm">No hay citas registradas.</div>
          {tab === 'upcoming' && (
            <button className="btn btn-primary btn-sm mt-4 mx-auto" onClick={() => navigate('/patient/book')}>
              Agendar nueva cita
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center flex-shrink-0">
                  <div className="text-xs font-medium leading-none">{a.date.split(' ')[1]}</div>
                  <div className="text-base font-bold leading-none mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>{a.date.split(' ')[0]}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{a.doctor}</span>
                    <span className={`badge text-xs ${statusBadge[a.status]}`}>{a.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User size={11} /> {a.specialty}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {a.time}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {a.date}</span>
                  </div>
                </div>
                {a.group === 'upcoming' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="btn btn-secondary btn-sm text-xs" onClick={() => setRescheduleId(a.id)}>
                      <RefreshCw size={11} /> Reprogramar
                    </button>
                    <button className="btn btn-danger btn-sm text-xs" onClick={() => setCancelId(a.id)}>
                      <X size={11} /> Cancelar
                    </button>
                  </div>
                )}
                {a.group === 'past' && (
                  <button className="btn btn-ghost btn-sm text-blue-600 text-xs flex-shrink-0">
                    Ver resumen <ChevronRight size={11} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel modal */}
      {cancelId !== null && (
        <div className="modal-overlay" onClick={closeCancel}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            {!cancelDone ? (
              <>
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <X size={28} className="text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>¿Cancelar esta cita?</h2>
                <p className="text-slate-500 text-sm mb-6">Esta acción no puede deshacerse. Si cambias de opinión, deberás agendar una nueva cita.</p>
                <div className="flex gap-3">
                  <button className="btn btn-secondary flex-1" onClick={closeCancel}>No, mantener</button>
                  <button className="btn btn-danger flex-1" disabled={busy} onClick={confirmCancel}>Sí, cancelar</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Cita cancelada correctamente.</h2>
                <p className="text-slate-500 text-sm mb-5">Tu cita ha sido cancelada. Puedes agendar una nueva cuando desees.</p>
                <button className="btn btn-primary w-full justify-center" onClick={closeCancel}>Aceptar</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleId !== null && (
        <div className="modal-overlay" onClick={closeReschedule}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            {!rescheduleDone ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Reprogramar cita</h2>
                  <button onClick={closeReschedule}><X size={18} className="text-slate-400" /></button>
                </div>
                <div className="space-y-4">{error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nueva fecha</label>
                    <input type="date" className="input-field" min={day()} value={newDate} onChange={e => setNewDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nuevo horario</label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map(t => {
                        const booked = bookedSlots.includes(t);
                        return (
                          <button key={t} disabled={booked}
                            className={`py-2 rounded-lg text-xs font-medium border transition-all ${booked ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through' : newTime === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}
                            onClick={() => !booked && setNewTime(t)}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}<div className="flex gap-3 mt-5">
                  <button className="btn btn-secondary flex-1" onClick={closeReschedule}>Cancelar</button>
                  <button className="btn btn-primary flex-1" onClick={confirmReschedule} disabled={busy||!newDate||!newTime||bookedSlots.includes(newTime)}>
                    <Check size={13} /> Confirmar
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle size={36} className="text-green-500 mx-auto mb-3" />
                <h2 className="text-base font-bold text-slate-900 mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Cita reprogramada</h2>
                <p className="text-sm text-slate-500 mb-4">Tu cita fue actualizada correctamente.</p>
                <button className="btn btn-primary w-full justify-center" onClick={closeReschedule}>Aceptar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
