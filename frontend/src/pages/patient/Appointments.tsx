import {RescheduleModal} from '../../components/UnattendedAppointments';
import PatientAppointmentSummary from '../../components/PatientAppointmentSummary';
import {useClinic,money} from '../../context/Clinic';
import {paymentSummary} from '../../lib/paymentBalances';
import {appointmentStatus} from '../../lib/appointmentStatus';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, X, RefreshCw, Check, CheckCircle, ChevronRight } from 'lucide-react';


const statusBadge: Record<string, string> = {
  'Confirmada': 'bg-blue-100 text-blue-700',
  'Solicitada': 'bg-slate-100 text-slate-600',
  'Finalizada': 'bg-green-100 text-green-700',
  'Cancelada': 'bg-red-100 text-red-700',
  'No asistió': 'bg-orange-100 text-orange-700',
  'No atendida': 'bg-orange-100 text-orange-700',
  'En espera': 'bg-amber-100 text-amber-700',
  'En consulta': 'bg-purple-100 text-purple-700',
};



export default function PatientAppointments() {
  const navigate = useNavigate();
  const {panel,mutate,busy,reload}=useClinic();const [error,setError]=useState('');
  useEffect(()=>{reload().catch(()=>{});},[reload]);
  const appts=panel.appointments.map(a=>({id:a.id,doctor:String(a.medico),specialty:String(a.especialidad),date:new Date(a.inicio).toLocaleDateString('es-SV',{day:'2-digit',month:'short',year:'numeric'}),time:new Date(a.inicio).toLocaleTimeString('es-SV',{hour:'2-digit',minute:'2-digit'}),status:appointmentStatus({estado:a.estado,inicio:a.inicio}),payment:a.estado==='Finalizada'?paymentSummary(a.precio,a.pagado):null,group:a.estado==='Cancelada'?'cancelled':new Date(a.inicio)>new Date()&&!['Finalizada','No asistió'].includes(a.estado)?'upcoming':'past'}));
  const [summaryId,setSummaryId]=useState<number|null>(()=>Number(new URLSearchParams(window.location.search).get('cita'))||null);

  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>(summaryId?'past':'upcoming');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelDone, setCancelDone] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);

  const filtered = appts.filter(a => a.group === tab);

  const confirmCancel = async()=>{setError('');try{await mutate(`/citas/${cancelId}/estado?estado=Cancelada`,undefined,'PATCH');setCancelDone(true);}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo cancelar.');}};
  const closeCancel = () => { setCancelId(null); setCancelDone(false); };

  const current=panel.appointments.find(a=>a.id===rescheduleId);
  const closeReschedule = () => setRescheduleId(null);

  return (
    <div className="p-6 max-w-screen-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mis citas</h1>
        <div className="flex gap-2"><button className="btn btn-secondary btn-sm" onClick={()=>reload().catch(()=>{})}>Actualizar</button><button className="btn btn-primary btn-sm" onClick={() => navigate('/patient/book')}>
          <Calendar size={13} />
          Agendar cita
        </button></div>
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
              <div className="flex flex-wrap sm:flex-nowrap items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center flex-shrink-0">
                  <div className="text-xs font-medium leading-none">{a.date.split(' ')[1]}</div>
                  <div className="text-base font-bold leading-none mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>{a.date.split(' ')[0]}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{a.doctor}</span>
                    <span className={`badge text-xs ${statusBadge[a.status]}`}>{a.status}</span>
                    {a.payment&&<span className={`badge text-xs ${a.payment.saldo>0?'bg-amber-100 text-amber-800':'bg-green-100 text-green-700'}`}>{a.payment.estado}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User size={11} /> {a.specialty}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {a.time}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {a.date}</span>
                  </div>
                  {a.payment&&<p className="text-xs text-slate-600 mt-2">Total: {money(a.payment.total)} · Pagado: {money(a.payment.pagado)} · Saldo: {money(a.payment.saldo)}</p>}
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
                <button className="btn btn-ghost btn-sm text-blue-600 text-xs flex-shrink-0" onClick={()=>setSummaryId(a.id)}>
                  {a.group==='past'?'Ver resumen':'Ver detalles'} <ChevronRight size={11} />
                </button>
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

      {current&&<RescheduleModal appointment={current} onClose={closeReschedule}/>}
      {summaryId!==null&&<PatientAppointmentSummary appointmentId={summaryId} onClose={()=>setSummaryId(null)}/>}
    </div>
  );
}
