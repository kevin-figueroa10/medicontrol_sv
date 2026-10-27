import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const logs = [
  { id: 1, datetime: '13 sep 2026, 10:45', user: 'María Pérez', role: 'Recepcionista', action: 'Registrar llegada', module: 'Sala de espera', desc: 'Registró llegada de Carlos Mendoza – Cita #089' },
  { id: 2, datetime: '13 sep 2026, 10:30', user: 'Dr. Eduardo Vega', role: 'Médico', action: 'Registrar consulta', module: 'Consultas', desc: 'Registró consulta #012 – Carlos Mendoza' },
  { id: 3, datetime: '13 sep 2026, 09:55', user: 'Sofía Ramírez', role: 'Administrador', action: 'Crear usuario', module: 'Usuarios', desc: 'Creó usuario para Dra. Andrea Fuentes' },
  { id: 4, datetime: '13 sep 2026, 09:20', user: 'María Pérez', role: 'Recepcionista', action: 'Reprogramar cita', module: 'Citas', desc: 'Reprogramó cita #045 de Luis Hernández al 15 sep' },
  { id: 5, datetime: '13 sep 2026, 08:45', user: 'Dr. Eduardo Vega', role: 'Médico', action: 'Generar receta', module: 'Recetas', desc: 'Generó receta #021 para Carlos Mendoza' },
  { id: 6, datetime: '13 sep 2026, 08:15', user: 'Sofía Ramírez', role: 'Administrador', action: 'Desactivar usuario', module: 'Usuarios', desc: 'Desactivó usuario Juan Morales (Médico)' },
  { id: 7, datetime: '12 sep 2026, 17:30', user: 'María Pérez', role: 'Recepcionista', action: 'Registrar pago', module: 'Pagos', desc: 'Registró pago PAG-004 – Roberto Flores – $75.00' },
  { id: 8, datetime: '12 sep 2026, 15:00', user: 'Dra. Patricia López', role: 'Médico', action: 'Solicitar estudio', module: 'Estudios', desc: 'Solicitó hemograma completo para María García' },
];

const actionColors: Record<string, string> = {
  'Registrar llegada': 'bg-indigo-100 text-indigo-700',
  'Registrar consulta': 'bg-blue-100 text-blue-700',
  'Crear usuario': 'bg-purple-100 text-purple-700',
  'Reprogramar cita': 'bg-amber-100 text-amber-700',
  'Generar receta': 'bg-green-100 text-green-700',
  'Desactivar usuario': 'bg-red-100 text-red-700',
  'Registrar pago': 'bg-emerald-100 text-emerald-700',
  'Solicitar estudio': 'bg-cyan-100 text-cyan-700',
};

export default function Audit() {
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    return l.user.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || l.module.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Auditoría del sistema</h1>
        <p className="text-sm text-slate-500">Registro de todas las acciones realizadas en el sistema</p>
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por usuario, módulo o descripción..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <button className="btn btn-secondary btn-sm"><Filter size={13} /> Filtros</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Fecha / Hora', 'Usuario', 'Rol', 'Acción', 'Módulo', 'Descripción'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="table-row border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{l.datetime}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800 whitespace-nowrap">{l.user}</td>
                  <td className="px-5 py-3.5">
                    <span className="badge bg-slate-100 text-slate-600 text-xs">{l.role}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge text-xs ${actionColors[l.action] || 'bg-slate-100 text-slate-600'}`}>{l.action}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{l.module}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 max-w-xs">{l.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
