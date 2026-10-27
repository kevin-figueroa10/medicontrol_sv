import { useState } from 'react';
import { Plus, Search, Eye, Edit3, UserX, UserCheck, X, AlertCircle } from 'lucide-react';

const doctors = [
  { code: 'MED-001', name: 'Dr. Eduardo Vega', specialty: 'Cardiología', jvpm: 'MP-4821', phone: '7654-0001', email: 'evega@medicontrol.sv', schedule: 'Lun–Vie 8:00–16:00', status: 'Activo' },
  { code: 'MED-002', name: 'Dra. Patricia López', specialty: 'Medicina General', jvpm: 'MP-3412', phone: '7654-0002', email: 'plopez@medicontrol.sv', schedule: 'Lun–Vie 8:00–12:00', status: 'Activo' },
  { code: 'MED-003', name: 'Dr. Carlos Torres', specialty: 'Pediatría', jvpm: 'MP-5567', phone: '7654-0003', email: 'ctorres@medicontrol.sv', schedule: 'Mar–Sáb 9:00–17:00', status: 'Activo' },
  { code: 'MED-004', name: 'Dra. Andrea Fuentes', specialty: 'Ginecología', jvpm: 'MP-6201', phone: '7654-0004', email: 'afuentes@medicontrol.sv', schedule: 'Lun–Jue 10:00–18:00', status: 'Activo' },
  { code: 'MED-005', name: 'Dr. Samuel Rivera', specialty: 'Dermatología', jvpm: 'MP-4990', phone: '7654-0005', email: 'srivera@medicontrol.sv', schedule: 'Lun, Mié, Vie 8:00–14:00', status: 'Activo' },
  { code: 'MED-006', name: 'Dr. Héctor Guzmán', specialty: 'Ortopedia', jvpm: 'MP-3120', phone: '7654-0006', email: 'hguzman@medicontrol.sv', schedule: 'Mar, Jue 8:00–16:00', status: 'Inactivo' },
];

interface ModalProps { mode: 'new' | 'edit' | 'view'; doctor?: typeof doctors[0]; onClose: () => void; }

function DoctorModal({ mode, doctor, onClose }: ModalProps) {
  const [form, setForm] = useState({
    name: doctor?.name ?? '', specialty: doctor?.specialty ?? '', jvpm: doctor?.jvpm ?? '',
    phone: doctor?.phone ?? '', email: doctor?.email ?? '', schedule: doctor?.schedule ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Obligatorio';
    if (!form.specialty) e.specialty = 'Obligatorio';
    if (!form.jvpm) e.jvpm = 'Obligatorio';
    setErrors(e);
    if (Object.keys(e).length === 0) onClose();
  };

  const readOnly = mode === 'view';
  const title = mode === 'new' ? 'Nuevo médico' : mode === 'edit' ? 'Editar médico' : 'Información del médico';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Nombre completo', key: 'name', placeholder: 'Ej. Dr. Eduardo Vega' },
            { label: 'Número JVPM / Matrícula', key: 'jvpm', placeholder: 'Ej. MP-4821' },
            { label: 'Teléfono', key: 'phone', placeholder: '7654-0000' },
            { label: 'Correo electrónico', key: 'email', placeholder: 'medico@email.com' },
            { label: 'Horario de atención', key: 'schedule', placeholder: 'Ej. Lun–Vie 8:00–16:00' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input
                type="text"
                className={`input-field ${errors[f.key] ? 'error' : ''}`}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={set(f.key)}
                readOnly={readOnly}
                style={readOnly ? { background: '#f8fafc' } : {}}
              />
              {errors[f.key] && <div className="flex items-center gap-1 mt-1 text-red-600 text-xs"><AlertCircle size={11} />{errors[f.key]}</div>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Especialidad</label>
            <select className="input-field" value={form.specialty} onChange={set('specialty')} disabled={readOnly}>
              <option value="">Seleccionar...</option>
              {['Medicina General','Cardiología','Pediatría','Ginecología','Dermatología','Ortopedia','Neurología'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {errors.specialty && <div className="flex items-center gap-1 mt-1 text-red-600 text-xs"><AlertCircle size={11} />{errors.specialty}</div>}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn btn-secondary flex-1" onClick={onClose}>{readOnly ? 'Cerrar' : 'Cancelar'}</button>
          {!readOnly && <button className="btn btn-primary flex-1" onClick={handleSave}>Guardar</button>}
        </div>
      </div>
    </div>
  );
}

export default function Doctors() {
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('Todos');
  const [modal, setModal] = useState<{ mode: 'new'|'edit'|'view'; doctor?: typeof doctors[0] } | null>(null);
  const [list, setList] = useState(doctors);

  const filtered = list.filter(d => {
    const q = search.toLowerCase();
    return (
      (d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)) &&
      (statusF === 'Todos' || d.status === statusF)
    );
  });

  const toggle = (code: string) =>
    setList(l => l.map(d => d.code === code ? { ...d, status: d.status === 'Activo' ? 'Inactivo' : 'Activo' } : d));

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Médicos</h1>
          <p className="text-sm text-slate-500">{filtered.length} médicos registrados</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ mode: 'new' })}>
          <Plus size={14} /> Nuevo médico
        </button>
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search size={15} className="text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, especialidad o código..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {['Todos','Activo','Inactivo'].map(s => (
            <button key={s} className={`tab-btn ${statusF === s ? 'active' : ''}`} onClick={() => setStatusF(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Código','Médico','Especialidad','JVPM','Teléfono','Correo','Horario','Estado','Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.code} className="table-row border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3.5"><span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{d.code}</span></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {d.name.replace('Dr. ','').replace('Dra. ','').split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <span className="text-sm font-medium text-slate-800 whitespace-nowrap">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{d.specialty}</td>
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{d.jvpm}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{d.phone}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500 max-w-[140px] truncate">{d.email}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{d.schedule}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${d.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button title="Ver" className="btn btn-ghost btn-sm p-1.5" onClick={() => setModal({ mode: 'view', doctor: d })}><Eye size={14} className="text-blue-600" /></button>
                      <button title="Editar" className="btn btn-ghost btn-sm p-1.5" onClick={() => setModal({ mode: 'edit', doctor: d })}><Edit3 size={14} className="text-slate-500" /></button>
                      <button title={d.status === 'Activo' ? 'Desactivar' : 'Activar'} className="btn btn-ghost btn-sm p-1.5" onClick={() => toggle(d.code)}>
                        {d.status === 'Activo' ? <UserX size={14} className="text-red-500" /> : <UserCheck size={14} className="text-green-600" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <DoctorModal mode={modal.mode} doctor={modal.doctor} onClose={() => setModal(null)} />}
    </div>
  );
}
