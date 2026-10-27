import { Eye, Download, FlaskConical } from 'lucide-react';

const studies = [
  { id: 'EST-001', study: 'Electrocardiograma', date: '08 sep 2026', doctor: 'Dr. Eduardo Vega', status: 'Resultado disponible', result: 'Ritmo sinusal normal. Frecuencia 72 lpm. Sin alteraciones significativas.' },
  { id: 'EST-002', study: 'Hemograma completo', date: '01 ago 2026', doctor: 'Dr. Eduardo Vega', status: 'Revisado', result: 'Valores dentro de rangos normales. Hb 14.5 g/dL.' },
  { id: 'EST-003', study: 'Perfil lipídico', date: '01 ago 2026', doctor: 'Dr. Eduardo Vega', status: 'Revisado', result: 'Colesterol total 195 mg/dL. LDL 120 mg/dL. Perfil aceptable.' },
  { id: 'EST-004', study: 'Radiografía de tórax', date: '20 jun 2026', doctor: 'Dr. Eduardo Vega', status: 'Pendiente', result: null },
];

const statusBadge: Record<string, string> = {
  'Pendiente': 'bg-amber-100 text-amber-700',
  'Resultado disponible': 'bg-blue-100 text-blue-700',
  'Revisado': 'bg-green-100 text-green-700',
};

export default function PatientStudies() {
  return (
    <div className="p-6 max-w-screen-md">
      <h1 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mis estudios médicos</h1>

      <div className="space-y-3">
        {studies.map(s => (
          <div key={s.id} className="card p-5">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.status === 'Pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                <FlaskConical size={18} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900">{s.study}</span>
                  <span className={`badge text-xs ${statusBadge[s.status]}`}>{s.status}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  {s.date} · Solicitado por {s.doctor}
                </div>
                {s.result && (
                  <div className="bg-slate-50 rounded-xl p-3 mb-3">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Resultado</div>
                    <p className="text-sm text-slate-700">{s.result}</p>
                  </div>
                )}
                {s.status !== 'Pendiente' && (
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm text-blue-600 text-xs"><Eye size={12} /> Ver documento</button>
                    <button className="btn btn-ghost btn-sm text-slate-500 text-xs"><Download size={12} /> Descargar</button>
                  </div>
                )}
                {s.status === 'Pendiente' && (
                  <p className="text-xs text-amber-600">Resultado pendiente de carga.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
