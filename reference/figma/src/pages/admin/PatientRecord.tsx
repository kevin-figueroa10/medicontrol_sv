import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, Calendar, FileText, FlaskConical,
  Activity, Clock, Plus, TrendingUp, Heart, Thermometer,
  Weight, Ruler, Wind, Droplets, ChevronRight
} from 'lucide-react';

const tabs = ['Resumen', 'Historial de consultas', 'Signos vitales', 'Recetas', 'Estudios médicos', 'Seguimientos', 'Citas', 'Documentos'];

const consultations = [
  { date: '10 sep 2026', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', diagnosis: 'Hipertensión arterial controlada', status: 'Finalizada' },
  { date: '12 ago 2026', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', diagnosis: 'Control rutinario – sin cambios', status: 'Finalizada' },
  { date: '18 jul 2026', doctor: 'Dra. Patricia López', specialty: 'Med. General', diagnosis: 'Gripe estacional – tratamiento ambulatorio', status: 'Finalizada' },
  { date: '05 jun 2026', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', diagnosis: 'Ajuste de medicación antihipertensiva', status: 'Finalizada' },
];

const vitals = [
  { date: '10 sep 2026', pa: '135/85', temp: '36.8°C', peso: '82 kg', altura: '175 cm', fc: '72 bpm', spo2: '98%' },
  { date: '12 ago 2026', pa: '140/90', temp: '36.6°C', peso: '83 kg', altura: '175 cm', fc: '78 bpm', spo2: '97%' },
  { date: '05 jun 2026', pa: '138/88', temp: '36.7°C', peso: '84 kg', altura: '175 cm', fc: '74 bpm', spo2: '98%' },
];

const prescriptions = [
  { date: '10 sep 2026', doctor: 'Dr. Eduardo Vega', meds: ['Losartán 50mg – 1 vez al día', 'Amlodipino 5mg – 1 vez al día'] },
  { date: '05 jun 2026', doctor: 'Dr. Eduardo Vega', meds: ['Enalapril 10mg – 2 veces al día'] },
];

const studies = [
  { date: '08 sep 2026', study: 'Electrocardiograma', doctor: 'Dr. Eduardo Vega', status: 'Resultado disponible' },
  { date: '01 ago 2026', study: 'Hemograma completo', doctor: 'Dr. Eduardo Vega', status: 'Revisado' },
  { date: '01 ago 2026', study: 'Perfil lipídico', doctor: 'Dr. Eduardo Vega', status: 'Revisado' },
];

const timeline = [
  { date: 'Sep 10, 2026', event: 'Consulta – Cardiología', detail: 'Control de hipertensión. Ajuste de medicación.', type: 'consult' },
  { date: 'Sep 08, 2026', event: 'Estudio solicitado', detail: 'Electrocardiograma – resultado disponible.', type: 'study' },
  { date: 'Ago 12, 2026', event: 'Consulta – Cardiología', detail: 'Control rutinario. Sin cambios.', type: 'consult' },
  { date: 'Jul 18, 2026', event: 'Consulta – Med. General', detail: 'Gripe estacional. Tratamiento ambulatorio.', type: 'consult' },
  { date: 'Jun 05, 2026', event: 'Consulta – Cardiología', detail: 'Ajuste de antihipertensivo.', type: 'consult' },
];

const timelineColor: Record<string, string> = {
  consult: 'bg-blue-500',
  study: 'bg-amber-500',
  prescription: 'bg-green-500',
};

export default function PatientRecord() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
        <button className="hover:text-blue-600" onClick={() => navigate('/admin/patients')}>Pacientes</button>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Carlos Alberto Mendoza</span>
      </div>

      {/* Patient header */}
      <div className="card p-5 mb-4">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            CM
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <div>
                <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Carlos Alberto Mendoza</h1>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-0.5 flex-wrap">
                  <span>45 años · Masculino</span>
                  <span className="flex items-center gap-1"><Phone size={12} /> 7654-3210</span>
                  <span className="flex items-center gap-1"><Mail size={12} /> carlos@email.com</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">PAC-001</span>
                </div>
              </div>
              <span className="badge bg-green-100 text-green-700 ml-auto">Activo</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span>Médico tratante: <strong className="text-slate-700">Dr. Eduardo Vega</strong></span>
              <span>Especialidad: <strong className="text-slate-700">Cardiología</strong></span>
              <span>Última consulta: <strong className="text-slate-700">10 sep 2026</strong></span>
              <span>Próxima cita: <strong className="text-blue-600">20 sep 2026, 10:00 AM</strong></span>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm flex-shrink-0"
            onClick={() => navigate('/doctor/consultation')}
          >
            <Plus size={13} />
            Nueva consulta
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`tab-btn whitespace-nowrap ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Summary cards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Last vitals */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 text-sm mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Últimos signos vitales – 10 sep 2026</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { icon: <Heart size={16} className="text-red-500" />, label: 'P. Arterial', value: '135/85', unit: 'mmHg' },
                  { icon: <Thermometer size={16} className="text-orange-500" />, label: 'Temperatura', value: '36.8', unit: '°C' },
                  { icon: <Weight size={16} className="text-blue-500" />, label: 'Peso', value: '82', unit: 'kg' },
                  { icon: <Ruler size={16} className="text-indigo-500" />, label: 'Altura', value: '175', unit: 'cm' },
                  { icon: <Activity size={16} className="text-green-500" />, label: 'Frec. cardíaca', value: '72', unit: 'bpm' },
                  { icon: <Droplets size={16} className="text-cyan-500" />, label: 'SpO₂', value: '98', unit: '%' },
                ].map(v => (
                  <div key={v.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="flex justify-center mb-1">{v.icon}</div>
                    <div className="text-lg font-bold text-slate-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>{v.value}</div>
                    <div className="text-xs text-slate-400">{v.unit}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{v.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent consultations */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Consultas recientes</h2>
                <button className="text-xs text-blue-600 hover:underline" onClick={() => setActiveTab(1)}>Ver historial completo</button>
              </div>
              <div className="space-y-3">
                {consultations.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileText size={15} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{c.diagnosis}</div>
                      <div className="text-xs text-slate-500">{c.doctor} · {c.specialty}</div>
                    </div>
                    <div className="text-xs text-slate-400">{c.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Línea de tiempo clínica</h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-5">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`w-6 h-6 rounded-full ${timelineColor[t.type]} flex-shrink-0 z-10 flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">{t.date}</div>
                      <div className="text-sm font-medium text-slate-800 mt-0.5">{t.event}</div>
                      <div className="text-xs text-slate-500">{t.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Fecha', 'Médico', 'Especialidad', 'Diagnóstico', 'Estado', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {consultations.map((c, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{c.date}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-800 font-medium">{c.doctor}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{c.specialty}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{c.diagnosis}</td>
                    <td className="px-5 py-3.5"><span className="badge bg-green-100 text-green-700">{c.status}</span></td>
                    <td className="px-5 py-3.5"><button className="btn btn-ghost btn-sm text-blue-600">Ver</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Fecha', 'P. Arterial', 'Temperatura', 'Peso', 'Altura', 'Frec. Cardíaca', 'SpO₂'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vitals.map((v, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{v.date}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-red-600">{v.pa}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{v.temp}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{v.peso}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{v.altura}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{v.fc}</td>
                    <td className="px-5 py-3.5 text-sm text-green-600 font-medium">{v.spo2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="space-y-4">
          {prescriptions.map((p, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{p.date}</div>
                  <div className="text-xs text-slate-500">{p.doctor}</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/doctor/prescription')}>
                  <FileText size={13} />
                  Ver receta
                </button>
              </div>
              <div className="space-y-1.5">
                {p.meds.map((m, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 4 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Fecha', 'Estudio', 'Médico solicitante', 'Estado', 'Acción'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studies.map((s, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{s.date}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{s.study}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{s.doctor}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${s.status === 'Resultado disponible' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><button className="btn btn-ghost btn-sm text-blue-600">Ver resultado</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5 – Seguimientos */}
      {activeTab === 5 && (
        <div className="space-y-3">
          {[
            { date: '13 sep 2026', doctor: 'Dr. Eduardo Vega', reason: 'Control de hipertensión arterial', recommended: '04 oct 2026', status: 'Pendiente' },
            { date: '12 ago 2026', doctor: 'Dr. Eduardo Vega', reason: 'Control post-consulta', recommended: '12 sep 2026', status: 'Completado' },
          ].map((f, i) => (
            <div key={i} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{f.reason}</div>
                <div className="text-xs text-slate-500 mt-0.5">{f.doctor} · Última consulta: {f.date}</div>
                <div className="text-xs text-slate-500">Fecha recomendada: <strong>{f.recommended}</strong></div>
              </div>
              <span className={`badge self-start sm:self-auto ${f.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{f.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6 – Citas */}
      {activeTab === 6 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Fecha','Hora','Médico','Especialidad','Motivo','Estado'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '20 sep 2026', time: '10:00 AM', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', reason: 'Control de HTA', status: 'Confirmada' },
                  { date: '13 sep 2026', time: '09:00 AM', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', reason: 'Control de HTA', status: 'Finalizada' },
                  { date: '12 ago 2026', time: '09:00 AM', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', reason: 'Control rutinario', status: 'Finalizada' },
                  { date: '18 jul 2026', time: '10:30 AM', doctor: 'Dra. Patricia López', specialty: 'Med. General', reason: 'Gripe', status: 'Finalizada' },
                ].map((a, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{a.date}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{a.time}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{a.doctor}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{a.specialty}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{a.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${a.status === 'Confirmada' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7 – Documentos */}
      {activeTab === 7 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Nombre','Tipo','Fecha','Médico','Acciones'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Resultado ECG – Sep 2026', type: 'PDF', date: '08 sep 2026', doctor: 'Dr. Eduardo Vega' },
                  { name: 'Hemograma completo – Ago 2026', type: 'PDF', date: '01 ago 2026', doctor: 'Dr. Eduardo Vega' },
                  { name: 'Radiografía de tórax – Jun 2026', type: 'JPG', date: '15 jun 2026', doctor: 'Dr. Eduardo Vega' },
                  { name: 'Consentimiento informado', type: 'PDF', date: '10 abr 2026', doctor: 'Dr. Eduardo Vega' },
                ].map((d, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{d.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${d.type === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{d.type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{d.date}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{d.doctor}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-sm text-blue-600 text-xs">Ver</button>
                        <button className="btn btn-ghost btn-sm text-slate-500 text-xs">Descargar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
