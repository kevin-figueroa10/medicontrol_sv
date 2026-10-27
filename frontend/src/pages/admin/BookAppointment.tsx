import {useEffect} from 'react';
import {api} from '../../lib/api';
import {useClinic,day,money,Row} from '../../context/Clinic';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Calendar, Clock, User, Stethoscope, FileText, CheckCircle } from 'lucide-react';

const steps = [
  { label: 'Paciente', icon: <User size={16} /> },
  { label: 'Especialidad', icon: <Stethoscope size={16} /> },
  { label: 'Médico', icon: <User size={16} /> },
  { label: 'Fecha', icon: <Calendar size={16} /> },
  { label: 'Horario', icon: <Clock size={16} /> },
  { label: 'Motivo', icon: <FileText size={16} /> },
  { label: 'Confirmar', icon: <Check size={16} /> },
];

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];


export default function BookAppointment() {
  const navigate = useNavigate();const {panel,session,mutate,busy}=useClinic();
  const patientMode=session.rol==='Paciente';
  const [search,setSearch]=useState(''),[service,setService]=useState(''),[error,setError]=useState('');
  const patients=panel.patients.filter(p=>p.activo&&String(p.nombre).toLowerCase().includes(search.toLowerCase())).map(p=>`${p.nombre} · #${p.id}`);
  const specialties=[...new Set(panel.doctors.filter(d=>d.activo).map(d=>String(d.especialidad)))];
  const doctors:Record<string,string[]>={};for(const d of panel.doctors.filter(d=>d.activo))(doctors[d.especialidad]??=[]).push(`${d.nombre} · #${d.id}`);
  const [availability,setAvailability]=useState<{ocupados:Row[];bloqueados:Row[];horarios:Row[]}|null>(null);

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    patient: patientMode&&panel.patients[0]?`${panel.patients[0].nombre} · #${panel.patients[0].id}`:'',
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    reason: '',
  });
  const [done, setDone] = useState(false);

  const selectedDoctor=panel.doctors.find(d=>`${d.nombre} · #${d.id}`===data.doctor);
  const selectedPatient=panel.patients.find(p=>`${p.nombre} · #${p.id}`===data.patient);
  useEffect(()=>{setAvailability(null);if(!selectedDoctor||!data.date)return;const controller=new AbortController();api<{ocupados:Row[];bloqueados:Row[];horarios:Row[]}>(`/medicos/${selectedDoctor.id}/disponibilidad?fecha=${data.date}`,{signal:controller.signal}).then(setAvailability).catch(()=>{if(!controller.signal.aborted)setError('No se pudo comprobar el horario.');});return ()=>controller.abort();},[selectedDoctor?.id,data.date]);
  const duration=Number(panel.services.find(s=>s.id===Number(service))?.duracionMinutos||panel.clinic?.duracionMinutos||30)*60000;
  const bookedSlots=timeSlots.filter(t=>{const start=new Date(data.date+'T'+t),end=new Date(start.valueOf()+duration);return !availability||(availability.horarios.length>0&&!availability.horarios.some(h=>h.diaSemana===start.getDay()&&t>=String(h.desde).slice(0,5)&&new Date(end).toTimeString().slice(0,5)<=String(h.hasta).slice(0,5)))||start<new Date()||[...availability.ocupados,...availability.bloqueados].some(a=>new Date(a.inicio)<end&&new Date(a.fin)>start)||panel.appointments.some(a=>a.pacienteId===selectedPatient?.id&&!['Cancelada','No asistió'].includes(a.estado)&&new Date(a.inicio)<end&&new Date(a.fin)>start);});
  const next = () => {setError('');if([!data.patient,!data.specialty||!service,!data.doctor,!data.date||data.date<day(),!data.time||bookedSlots.includes(data.time),!data.reason.trim()][step]){setError('Complete este paso con información válida.');return;}setStep(s=>Math.min(s+1,6));};
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const confirm = async () => {if(!selectedDoctor||!selectedPatient||!service)return;try{const start=new Date(data.date+'T'+data.time);await mutate('/citas',{pacienteId:selectedPatient.id,medicoId:selectedDoctor.id,servicioId:Number(service),inicio:start.toISOString(),fin:new Date(start.valueOf()+duration).toISOString(),motivo:data.reason});setDone(true);}catch{}}

  if (done) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>¡Cita registrada correctamente!</h2>
          <p className="text-slate-500 text-sm mb-6">La cita ha sido agendada y se notificará al paciente.</p>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
            {[
              ['Paciente', data.patient],
              ['Médico', data.doctor],
              ['Especialidad', data.specialty],
              ['Fecha', data.date],
              ['Hora', data.time],
              ['Motivo', data.reason],['Servicio',panel.services.find(s=>s.id===Number(service))?.nombre||''],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-800 font-medium">{v || '–'}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary flex-1" onClick={() => { setDone(false); setStep(0); setData({ patient:'',specialty:'',doctor:'',date:'',time:'',reason:'' }); }}>Nueva cita</button>
            <button className="btn btn-primary flex-1" onClick={() => navigate(patientMode?'/patient/appointments':'/admin/agenda')}>Ver agenda</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Agendar nueva cita</h1>
        <p className="text-sm text-slate-500">Sigue los pasos para registrar la cita</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              i < step ? 'bg-green-100 text-green-700' :
              i === step ? 'bg-blue-600 text-white' :
              'bg-slate-100 text-slate-400'
            }`}>
              {i < step ? <Check size={13} /> : s.icon}
              <span className="hidden sm:inline whitespace-nowrap">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={16} className="text-slate-300 mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6">{error&&<p role="alert" className="mb-4 text-red-700 text-sm">{error}</p>}
        {/* Step 0 – Patient */}
        {step === 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Seleccionar paciente</h2>
            <div className="mb-4">
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre o código..." className="input-field mb-4" />
              <div className="space-y-2">{!patients.length&&<p className="text-sm text-slate-500">No hay pacientes disponibles. Registre o vincule un expediente primero.</p>}
                {patients.map(p => (
                  <button
                    key={p}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${data.patient === p ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setData(d => ({ ...d, patient: p }))}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {p.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{p}</span>
                      {data.patient === p && <Check size={14} className="text-blue-600 ml-auto" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1 – Specialty */}
        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Seleccionar especialidad</h2><label className="block text-sm text-slate-700 mb-4">Servicio<select className="input-field mt-2" value={service} onChange={e=>{setService(e.target.value);setData(d=>({...d,time:''}));}}><option value="">Seleccionar servicio…</option>{panel.services.filter(s=>s.activo).map(s=><option key={s.id} value={s.id}>{s.nombre} · {money(s.precio)}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              {specialties.map(s => (
                <button
                  key={s}
                  className={`p-4 rounded-xl border text-left transition-all ${data.specialty === s ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                  onClick={() => setData(d => ({ ...d, specialty: s, doctor: '',time:'' }))}
                >
                  <div className="text-sm font-medium text-slate-800">{s}</div>
                  {data.specialty === s && <Check size={13} className="text-blue-600 mt-1" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 – Doctor */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Seleccionar médico</h2>
            <div className="space-y-2">
              {(doctors[data.specialty] || []).map(doc => (
                <button
                  key={doc}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${data.doctor === doc ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                  onClick={() => setData(d => ({ ...d, doctor: doc,time:'' }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                      {doc.replace('Dr. ','').replace('Dra. ','').split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{doc}</div>
                      <div className="text-xs text-slate-500">{data.specialty}</div>
                    </div>
                    {data.doctor === doc && <Check size={14} className="text-blue-600 ml-auto" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 – Date */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Seleccionar fecha</h2>
            <input
              type="date"
              className="input-field"
              min={day()} max={day(new Date(Date.now()+Number(panel.clinic?.anticipoDias||60)*86400000).toISOString())}
              value={data.date}
              onChange={e => setData(d => ({ ...d, date: e.target.value,time:'' }))}
            />
          </div>
        )}

        {/* Step 4 – Time */}
        {step === 4 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Seleccionar horario disponible</h2>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(t => {
                const isBooked = bookedSlots.includes(t);
                return (
                  <button
                    key={t}
                    disabled={isBooked}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      isBooked ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through' :
                      data.time === t ? 'bg-blue-600 text-white border-blue-600' :
                      'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => !isBooked && setData(d => ({ ...d, time: t }))}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-3">Los horarios tachados ya están ocupados.</p>
          </div>
        )}

        {/* Step 5 – Reason */}
        {step === 5 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Motivo de consulta</h2>
            <textarea
              className="input-field resize-none"
              maxLength={500} rows={4}
              placeholder="Describe el motivo de la consulta..."
              value={data.reason}
              onChange={e => setData(d => ({ ...d, reason: e.target.value }))}
            />
          </div>
        )}

        {/* Step 6 – Confirm */}
        {step === 6 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Confirmar información</h2>
            <div className="bg-slate-50 rounded-xl p-5 space-y-3">
              {[
                ['Paciente', data.patient],
                ['Médico', data.doctor],
                ['Especialidad', data.specialty],
                ['Fecha', data.date],
                ['Hora', data.time],
                ['Motivo', data.reason],['Servicio',panel.services.find(s=>s.id===Number(service))?.nombre||''],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium text-right max-w-[60%]">{v || <span className="text-slate-400">–</span>}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button className="btn btn-secondary" onClick={prev}>Atrás</button>
          )}
          <div className="flex-1" />
          {step < 6 ? (
            <button className="btn btn-primary" onClick={next}>
              Continuar <ChevronRight size={14} />
            </button>
          ) : (
            <button className="btn btn-primary" disabled={busy} onClick={confirm}>
              <Check size={14} />
              Confirmar cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
