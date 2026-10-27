import { useState } from 'react';
import { Plus, Search, FileText, Download, Eye } from 'lucide-react';

const studies = [
  { id: 'EST-001', patient: 'Carlos Mendoza', study: 'Electrocardiograma', doctor: 'Dr. Eduardo Vega', date: '08 sep 2026', status: 'Resultado disponible' },
  { id: 'EST-002', patient: 'María García', study: 'Hemograma completo', doctor: 'Dra. Patricia López', date: '07 sep 2026', status: 'Revisado' },
  { id: 'EST-003', patient: 'Ana Martínez', study: 'Ultrasonografía abdominal', doctor: 'Dr. Carlos Torres', date: '10 sep 2026', status: 'Solicitado' },
  { id: 'EST-004', patient: 'Roberto Flores', study: 'Perfil lipídico', doctor: 'Dr. Eduardo Vega', date: '05 sep 2026', status: 'Pendiente' },
  { id: 'EST-005', patient: 'Sofía Torres', study: 'Radiografía de tórax', doctor: 'Dr. Eduardo Vega', date: '03 sep 2026', status: 'Resultado disponible' },
  { id: 'EST-006', patient: 'Luis Hernández', study: 'Examen general de orina', doctor: 'Dra. Patricia López', date: '01 sep 2026', status: 'Revisado' },
];

const statusBadge: Record<string, string> = {
  'Solicitado': 'bg-slate-100 text-slate-600',
  'Pendiente': 'bg-amber-100 text-amber-700',
  'Resultado disponible': 'bg-blue-100 text-blue-700',
  'Revisado': 'bg-green-100 text-green-700',
};

export default function Studies() {
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('Todos');
  const [showModal, setShowModal] = useState(false);

  const filtered = studies.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.patient.toLowerCase().includes(q) || s.study.toLowerCase().includes(q)) &&
      (statusF === 'Todos' || s.status === statusF)
    );
  });

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Estudios médicos</h1>
          <p className="text-sm text-slate-500">{filtered.length} órdenes registradas</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={13} />
          Solicitar estudio
        </button>
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Todos', 'Solicitado', 'Pendiente', 'Resultado disponible', 'Revisado'].map(s => (
            <button key={s} className={`tab-btn text-xs ${statusF === s ? 'active' : ''}`} onClick={() => setStatusF(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Código', 'Paciente', 'Estudio', 'Médico solicitante', 'Fecha', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="table-row border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-400">{s.id}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{s.patient}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-700">{s.study}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{s.doctor}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{s.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${statusBadge[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      {['Resultado disponible', 'Revisado'].includes(s.status) && (
                        <>
                          <button className="btn btn-ghost btn-sm p-1.5 text-blue-600"><Eye size={13} /></button>
                          <button className="btn btn-ghost btn-sm p-1.5 text-slate-500"><Download size={13} /></button>
                        </>
                      )}
                      <button className="btn btn-ghost btn-sm p-1.5 text-slate-500"><FileText size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>Solicitar estudio médico</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
                <input type="text" className="input-field" placeholder="Nombre del paciente" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de estudio</label>
                <select className="input-field">
                  <option>Hemograma completo</option>
                  <option>Examen general de orina</option>
                  <option>Ultrasonografía</option>
                  <option>Radiografía</option>
                  <option>Electrocardiograma</option>
                  <option>Perfil lipídico</option>
                  <option>Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Indicaciones</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Indicaciones para el laboratorio..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary flex-1" onClick={() => setShowModal(false)}>Guardar orden</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
