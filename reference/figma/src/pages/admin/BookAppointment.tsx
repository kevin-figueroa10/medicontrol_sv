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

const patients = ['Carlos Alberto Mendoza', 'María Elena García', 'Roberto Flores Díaz', 'Ana Lucía Martínez', 'Luis Fernando Hernández'];
const specialties = ['Medicina General', 'Cardiología', 'Pediatría', 'Ginecología', 'Dermatología', 'Ortopedia'];
const doctors: Record<string, string[]> = {
  'Medicina General': ['Dra. Patricia López', 'Dr. Miguel Sánchez'],
  'Cardiología': ['Dr. Eduardo Vega', 'Dr. Roberto Castillo'],
  'Pediatría': ['Dr. Carlos Torres', 'Dra. Lucía Morales'],
  'Ginecología': ['Dra. Andrea Fuentes'],
  'Dermatología': ['Dr. Samuel Rivera'],
  'Ortopedia': ['Dr. Héctor Guzmán'],
};
const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
const bookedSlots = ['09:00', '10:00', '14:30'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    patient: '',
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    reason: '',
  });
  const [done, setDone] = useState(false);

  const next = () => setStep(s => Math.min(s + 1, 6));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const confirm = () => { setDone(true); }

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
              ['Motivo', data.reason],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-800 font-medium">{v || '–'}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary flex-1" onClick={() => { setDone(false); setStep(0); setData({ patient:'',specialty:'',doctor:'',date:'',time:'',reason:'' }); }}>Nueva cita</button>
            <button className="btn btn-primary flex-1" onClick={() => navigate('/admin/agenda')}>Ver agenda</button>
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

      <div className="card p-6">
        {/* Step 0 – Patient */}
        {step === 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Seleccionar paciente</h2>
            <div className="mb-4">
              <input type="text" placeholder="Buscar por nombre o código..." className="input-field mb-4" />
              <div className="space-y-2">
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
            <h2 className="text-base font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Seleccionar especialidad</h2>
            <div className="grid grid-cols-2 gap-3">
              {specialties.map(s => (
                <button
                  key={s}
                  className={`p-4 rounded-xl border text-left transition-all ${data.specialty === s ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                  onClick={() => setData(d => ({ ...d, specialty: s, doctor: '' }))}
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
                  onClick={() => setData(d => ({ ...d, doctor: doc }))}
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
              min="2026-09-13"
              value={data.date}
              onChange={e => setData(d => ({ ...d, date: e.target.value }))}
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
              rows={4}
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
                ['Motivo', data.reason],
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
            <button className="btn btn-primary" onClick={confirm}>
              <Check size={14} />
              Confirmar cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
