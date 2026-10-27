import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, X, CheckCircle } from 'lucide-react';

const followups = [
  { id: 'SEG-001', patient: 'Carlos Mendoza', doctor: 'Dr. Eduardo Vega', lastConsult: '13 sep 2026', reason: 'Control de hipertensión arterial', recommended: '04 oct 2026', status: 'Pendiente' },
  { id: 'SEG-002', patient: 'María García', doctor: 'Dra. Patricia López', lastConsult: '08 sep 2026', reason: 'Seguimiento post-gripe', recommended: '22 sep 2026', status: 'Programado' },
  { id: 'SEG-003', patient: 'Roberto Flores', doctor: 'Dr. Eduardo Vega', lastConsult: '05 sep 2026', reason: 'Control lipídico', recommended: '10 oct 2026', status: 'Pendiente' },
  { id: 'SEG-004', patient: 'Ana Martínez', doctor: 'Dr. Carlos Torres', lastConsult: '03 sep 2026', reason: 'Control pediátrico rutinario', recommended: '03 oct 2026', status: 'Programado' },
  { id: 'SEG-005', patient: 'Luis Hernández', doctor: 'Dr. Eduardo Vega', lastConsult: '28 ago 2026', reason: 'Evaluación cardíaca', recommended: '28 sep 2026', status: 'Vencido' },
  { id: 'SEG-006', patient: 'Sofía Torres', doctor: 'Dr. Eduardo Vega', lastConsult: '20 ago 2026', reason: 'Control post-consulta', recommended: '10 sep 2026', status: 'Completado' },
];

const statusBadge: Record<string, string> = {
  'Pendiente': 'bg-amber-100 text-amber-700',
  'Programado': 'bg-blue-100 text-blue-700',
  'Completado': 'bg-green-100 text-green-700',
  'Vencido': 'bg-red-100 text-red-700',
};

export default function Followups() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const filtered = followups.filter(f => {
    const q = search.toLowerCase();
    return (
      (f.patient.toLowerCase().includes(q) || f.reason.toLowerCase().includes(q)) &&
      (statusF === 'Todos' || f.status === statusF)
    );
  });

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Seguimientos</h1>
          <p className="text-sm text-slate-500">Control de seguimientos y controles posteriores</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={13} /> Nuevo seguimiento
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Pendientes', count: followups.filter(f => f.status === 'Pendiente').length, badge: 'bg-amber-50 text-amber-600' },
          { label: 'Programados', count: followups.filter(f => f.status === 'Programado').length, badge: 'bg-blue-50 text-blue-600' },
          { label: 'Completados', count: followups.filter(f => f.status === 'Completado').length, badge: 'bg-green-50 text-green-600' },
          { label: 'Vencidos', count: followups.filter(f => f.status === 'Vencido').length, badge: 'bg-red-50 text-red-600' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.badge}`}>
            <div className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.count}</div>
            <div className="text-xs opacity-80 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por paciente o motivo..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Todos','Pendiente','Programado','Completado','Vencido'].map(s => (
            <button key={s} className={`tab-btn text-xs ${statusF === s ? 'active' : ''}`} onClick={() => setStatusF(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Paciente','Médico','Última consulta','Motivo del seguimiento','Fecha recomendada','Estado','Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className={`table-row border-b border-slate-50 last:border-0 ${f.status === 'Vencido' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {f.patient.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{f.patient}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{f.doctor}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{f.lastConsult}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-700 max-w-[200px] truncate">{f.reason}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{f.recommended}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${statusBadge[f.status]}`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      {['Pendiente','Programado'].includes(f.status) && (
                        <button
                          className="btn btn-primary btn-sm text-xs"
                          onClick={() => navigate('/admin/book')}
                        >
                          <Calendar size={11} />
                          Agendar cita
                        </button>
                      )}
                      {f.status === 'Programado' && (
                        <button className="btn btn-success btn-sm text-xs">
                          <CheckCircle size={11} />
                          Completar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New followup modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Nuevo seguimiento</h2>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            {saved ? (
              <div className="text-center py-6">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p className="text-slate-700 font-medium">Seguimiento registrado correctamente.</p>
                <button className="btn btn-primary mt-4" onClick={() => { setSaved(false); setShowModal(false); }}>Cerrar</button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {[
                    { label: 'Paciente', placeholder: 'Nombre del paciente' },
                    { label: 'Consulta relacionada', placeholder: 'Ej. Consulta #012 – 13 sep 2026' },
                    { label: 'Motivo del seguimiento', placeholder: 'Motivo del control' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                      <input className="input-field" placeholder={f.placeholder} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha recomendada</label>
                    <input type="date" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Indicaciones</label>
                    <textarea className="input-field resize-none" rows={2} placeholder="Indicaciones para el seguimiento..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                    <textarea className="input-field resize-none" rows={2} placeholder="Observaciones adicionales..." />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-primary flex-1" onClick={() => setSaved(true)}>Guardar seguimiento</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
