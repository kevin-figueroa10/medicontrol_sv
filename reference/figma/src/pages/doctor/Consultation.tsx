import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, FileText, FlaskConical, Activity, CheckCircle, X, Heart, Thermometer, Weight, Ruler, Droplets } from 'lucide-react';

export default function Consultation() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    reason: 'Control de hipertensión arterial. Paciente refiere leve mareo ocasional.',
    pa: '135/85', temp: '36.8', peso: '82', altura: '175', fc: '72', spo2: '98',
    symptoms: 'Mareo leve ocasional. Sin cefalea. Sin disnea.',
    antecedents: 'Hipertensión arterial (2019). Diabetes mellitus tipo 2 controlada.',
    evaluation: 'Paciente en buen estado general. P/A levemente elevada. FC normal. Sin soplos cardíacos.',
    diagnosis: 'Hipertensión arterial controlada con ajuste pendiente de medicación.',
    treatment: 'Incrementar dosis de Losartán a 100mg/día. Continuar Amlodipino 5mg.',
    recommendations: 'Dieta baja en sodio. Ejercicio aeróbico moderado 30 min/día. Control en 3 semanas.',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = () => setSaved(true);

  if (saved) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Consulta guardada</h2>
          <p className="text-slate-500 text-sm mb-6">La consulta fue registrada correctamente en el expediente.</p>
          <div className="flex flex-col gap-2">
            <button className="btn btn-primary justify-center" onClick={() => navigate('/doctor/prescription')}>
              <FileText size={14} />
              Generar receta
            </button>
            <button className="btn btn-secondary justify-center" onClick={() => navigate('/admin/studies')}>
              <FlaskConical size={14} />
              Solicitar estudio
            </button>
            <button className="btn btn-ghost justify-center" onClick={() => { setSaved(false); navigate('/admin/waiting-room'); }}>
              Finalizar consulta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center text-base font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>CM</div>
            <div>
              <h1 className="text-base font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Carlos Alberto Mendoza</h1>
              <div className="text-xs text-slate-500">45 años · PAC-001 · Cardiología</div>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-slate-500">
            <div><span className="font-medium text-slate-700">Médico:</span> Dr. Eduardo Vega</div>
            <div><span className="font-medium text-slate-700">Fecha:</span> 13/09/2026</div>
            <div><span className="font-medium text-slate-700">Consulta #:</span> 012</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main form */}
        <div className="xl:col-span-2 space-y-5">
          {/* A. Motivo */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">A</span>
              Motivo de consulta
            </h2>
            <textarea
              className="input-field resize-none"
              rows={3}
              value={form.reason}
              onChange={set('reason')}
            />
          </div>

          {/* B. Signos vitales */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">B</span>
              Signos vitales
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: 'pa', label: 'Presión arterial', unit: 'mmHg', icon: <Heart size={14} className="text-red-500" />, placeholder: '120/80' },
                { key: 'temp', label: 'Temperatura', unit: '°C', icon: <Thermometer size={14} className="text-orange-500" />, placeholder: '36.6' },
                { key: 'peso', label: 'Peso', unit: 'kg', icon: <Weight size={14} className="text-blue-500" />, placeholder: '70' },
                { key: 'altura', label: 'Altura', unit: 'cm', icon: <Ruler size={14} className="text-indigo-500" />, placeholder: '170' },
                { key: 'fc', label: 'Frec. cardíaca', unit: 'bpm', icon: <Activity size={14} className="text-green-500" />, placeholder: '72' },
                { key: 'spo2', label: 'SpO₂', unit: '%', icon: <Droplets size={14} className="text-cyan-500" />, placeholder: '98' },
              ].map(v => (
                <div key={v.key}>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                    {v.icon} {v.label}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input-field pr-10"
                      placeholder={v.placeholder}
                      value={(form as any)[v.key]}
                      onChange={set(v.key)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{v.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Clinical info */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">C</span>
              Información clínica
            </h2>
            <div className="space-y-4">
              {[
                { key: 'symptoms', label: 'Síntomas / Observaciones', rows: 2 },
                { key: 'antecedents', label: 'Antecedentes relevantes', rows: 2 },
                { key: 'evaluation', label: 'Evaluación médica', rows: 3 },
                { key: 'diagnosis', label: 'Diagnóstico', rows: 2 },
                { key: 'treatment', label: 'Tratamiento', rows: 2 },
                { key: 'recommendations', label: 'Recomendaciones', rows: 2 },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
                  <textarea
                    className="input-field resize-none"
                    rows={f.rows}
                    value={(form as any)[f.key]}
                    onChange={set(f.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar – quick actions + history */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Acciones</h2>
            <div className="space-y-2">
              <button className="btn btn-primary w-full justify-center" onClick={handleSave}>
                <Save size={14} />
                Guardar consulta
              </button>
              <button className="btn btn-secondary w-full justify-center" onClick={() => navigate('/doctor/prescription')}>
                <FileText size={14} />
                Generar receta
              </button>
              <button className="btn btn-secondary w-full justify-center" onClick={() => navigate('/admin/studies')}>
                <FlaskConical size={14} />
                Solicitar estudio
              </button>
              <button className="btn btn-secondary w-full justify-center">
                <Activity size={14} />
                Programar seguimiento
              </button>
              <button className="btn btn-danger w-full justify-center" onClick={() => navigate('/admin/waiting-room')}>
                <X size={14} />
                Finalizar consulta
              </button>
            </div>
          </div>

          {/* Previous consultations */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Historial del paciente</h2>
            <div className="space-y-3">
              {[
                { date: '12 ago 2026', title: 'Control rutinario', dx: 'HTA controlada' },
                { date: '05 jun 2026', title: 'Ajuste medicación', dx: 'Cambio de Enalapril' },
                { date: '10 abr 2026', title: 'Primera consulta', dx: 'Diagnóstico HTA' },
              ].map((c, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-400">{c.date}</div>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">{c.title}</div>
                  <div className="text-xs text-slate-500">{c.dx}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies/alerts */}
          <div className="card p-5 border-amber-200 bg-amber-50">
            <h2 className="font-semibold text-amber-800 text-sm mb-2">Alertas clínicas</h2>
            <div className="space-y-1.5">
              <div className="text-xs text-amber-700 flex items-start gap-1.5">
                <span className="mt-0.5">⚠️</span>
                Alergia a Penicilina (reportada 2021)
              </div>
              <div className="text-xs text-amber-700 flex items-start gap-1.5">
                <span className="mt-0.5">⚠️</span>
                Diabetes tipo 2 – monitorear glucemia
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
