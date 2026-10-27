import {useClinic,date} from '../../context/Clinic';
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';


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
  const {panel}=useClinic();const [module,setModule]=useState('');const logs=panel.logs.map(l=>({id:l.id,datetime:date(l.fechaUtc,true),user:String(l.usuario||'Sistema'),role:String(l.rol||'Sistema'),action:String(l.accion),module:String(l.entidad),desc:String(l.descripcion||`Registro #${l.entidadId}`)}));
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    return (!module||l.module===module)&&(l.user.toLowerCase().includes(q)||l.desc.toLowerCase().includes(q)||l.module.toLowerCase().includes(q));
  });

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Auditoría del sistema</h1>
        <p className="text-sm text-slate-500">Últimas 500 acciones registradas en el sistema</p>
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por usuario, módulo o descripción..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <select aria-label="Filtrar módulo" className="input-field" style={{maxWidth:220}} value={module} onChange={e=>setModule(e.target.value)}><option value="">Todos los módulos</option>{[...new Set(logs.map(l=>l.module))].map(m=><option key={m}>{m}</option>)}</select>
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
              {!filtered.length&&<tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">No hay acciones con estos filtros.</td></tr>}{filtered.map(l => (
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
