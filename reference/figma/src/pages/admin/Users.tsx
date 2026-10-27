import { useState } from 'react';
import { Plus, Edit3, UserX, UserCheck, Shield } from 'lucide-react';

const users = [
  { id: 1, name: 'Sofía Ramírez', email: 'sofia@medicontrol.sv', role: 'Administrador', status: 'Activo', lastAccess: '13 sep 2026, 08:15' },
  { id: 2, name: 'Dr. Eduardo Vega', email: 'evega@medicontrol.sv', role: 'Médico', status: 'Activo', lastAccess: '13 sep 2026, 09:02' },
  { id: 3, name: 'Dra. Patricia López', email: 'plopez@medicontrol.sv', role: 'Médico', status: 'Activo', lastAccess: '13 sep 2026, 08:45' },
  { id: 4, name: 'María Pérez', email: 'mperez@medicontrol.sv', role: 'Recepcionista', status: 'Activo', lastAccess: '13 sep 2026, 08:00' },
  { id: 5, name: 'Carlos Mendoza', email: 'carlos@email.com', role: 'Paciente', status: 'Activo', lastAccess: '12 sep 2026, 20:30' },
  { id: 6, name: 'Juan Morales', email: 'jmorales@medicontrol.sv', role: 'Médico', status: 'Inactivo', lastAccess: '20 ago 2026, 14:00' },
];

const roleBadge: Record<string, string> = {
  'Administrador': 'bg-purple-100 text-purple-700',
  'Médico': 'bg-blue-100 text-blue-700',
  'Recepcionista': 'bg-indigo-100 text-indigo-700',
  'Paciente': 'bg-green-100 text-green-700',
};

export default function Users() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Usuarios y permisos</h1>
          <p className="text-sm text-slate-500">{users.length} usuarios registrados</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={13} />
          Crear usuario
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Usuario', 'Correo', 'Rol', 'Estado', 'Último acceso', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="table-row border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Shield size={12} className="text-slate-400" />
                      <span className={`badge ${roleBadge[u.role]}`}>{u.role}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${u.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{u.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{u.lastAccess}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-sm p-1.5"><Edit3 size={13} className="text-slate-500" /></button>
                      {u.status === 'Activo'
                        ? <button className="btn btn-ghost btn-sm p-1.5"><UserX size={13} className="text-red-500" /></button>
                        : <button className="btn btn-ghost btn-sm p-1.5"><UserCheck size={13} className="text-green-600" /></button>}
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
            <h2 className="text-lg font-bold text-slate-900 mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>Crear usuario</h2>
            <div className="space-y-4">
              {[
                { label: 'Nombre completo', placeholder: 'Nombre y apellidos' },
                { label: 'Correo electrónico', placeholder: 'usuario@medicontrol.sv' },
                { label: 'Contraseña temporal', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                  <input type="text" className="input-field" placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select className="input-field">
                  <option>Administrador</option>
                  <option>Médico</option>
                  <option>Recepcionista</option>
                  <option>Paciente</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary flex-1" onClick={() => setShowModal(false)}>Crear usuario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
