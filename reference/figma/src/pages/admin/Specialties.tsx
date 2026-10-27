import { useState } from 'react';
import { Plus, Edit3, ToggleLeft, ToggleRight, X } from 'lucide-react';

const initialSpecialties = [
  { id: 1, name: 'Medicina General', description: 'Atención médica primaria y preventiva', doctors: 2, status: 'Activo' },
  { id: 2, name: 'Cardiología', description: 'Diagnóstico y tratamiento de enfermedades del corazón', doctors: 2, status: 'Activo' },
  { id: 3, name: 'Pediatría', description: 'Atención médica a niños y adolescentes', doctors: 1, status: 'Activo' },
  { id: 4, name: 'Ginecología', description: 'Salud reproductiva y ginecológica femenina', doctors: 1, status: 'Activo' },
  { id: 5, name: 'Dermatología', description: 'Enfermedades de la piel, cabello y uñas', doctors: 1, status: 'Activo' },
  { id: 6, name: 'Ortopedia', description: 'Trastornos del sistema musculoesquelético', doctors: 1, status: 'Inactivo' },
];

const initialServices = [
  { id: 1, name: 'Consulta general', description: 'Consulta de medicina general', price: 35.00, duration: '30 min', status: 'Activo' },
  { id: 2, name: 'Consulta especializada', description: 'Consulta con médico especialista', price: 60.00, duration: '45 min', status: 'Activo' },
  { id: 3, name: 'Control médico', description: 'Control y seguimiento de paciente', price: 40.00, duration: '30 min', status: 'Activo' },
  { id: 4, name: 'Primera consulta', description: 'Consulta inicial con historial completo', price: 75.00, duration: '60 min', status: 'Activo' },
  { id: 5, name: 'Telenconsulta', description: 'Consulta virtual por videollamada', price: 30.00, duration: '20 min', status: 'Inactivo' },
];

function SpecialtyModal({ spec, onClose }: { spec?: typeof initialSpecialties[0]; onClose: () => void }) {
  const [name, setName] = useState(spec?.name ?? '');
  const [desc, setDesc] = useState(spec?.description ?? '');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{spec ? 'Editar especialidad' : 'Nueva especialidad'}</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Neurología" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea className="input-field resize-none" rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción breve..." />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={onClose}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function ServiceModal({ svc, onClose }: { svc?: typeof initialServices[0]; onClose: () => void }) {
  const [form, setForm] = useState({ name: svc?.name ?? '', desc: svc?.description ?? '', price: svc?.price?.toString() ?? '', duration: svc?.duration ?? '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{svc ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Nombre', key: 'name', placeholder: 'Ej. Consulta general' },
            { label: 'Descripción', key: 'desc', placeholder: 'Descripción del servicio' },
            { label: 'Precio ($)', key: 'price', placeholder: '0.00' },
            { label: 'Duración estimada', key: 'duration', placeholder: 'Ej. 30 min' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input className="input-field" value={(form as any)[f.key]} onChange={set(f.key)} placeholder={f.placeholder} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={onClose}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default function Specialties() {
  const [tab, setTab] = useState<'specialties' | 'services'>('specialties');
  const [specs, setSpecs] = useState(initialSpecialties);
  const [svcs, setSvcs] = useState(initialServices);
  const [specModal, setSpecModal] = useState<{ open: boolean; item?: typeof initialSpecialties[0] }>({ open: false });
  const [svcModal, setSvcModal] = useState<{ open: boolean; item?: typeof initialServices[0] }>({ open: false });

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Especialidades y servicios</h1>
          <p className="text-sm text-slate-500">Gestión de especialidades médicas y servicios del consultorio</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => tab === 'specialties' ? setSpecModal({ open: true }) : setSvcModal({ open: true })}
        >
          <Plus size={13} />
          {tab === 'specialties' ? 'Nueva especialidad' : 'Nuevo servicio'}
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        <button className={`tab-btn ${tab === 'specialties' ? 'active' : ''}`} onClick={() => setTab('specialties')}>Especialidades</button>
        <button className={`tab-btn ${tab === 'services' ? 'active' : ''}`} onClick={() => setTab('services')}>Servicios</button>
      </div>

      {tab === 'specialties' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map(s => (
            <div key={s.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {s.name[0]}
                </div>
                <span className={`badge ${s.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{s.status}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{s.description}</p>
              <div className="text-xs text-slate-400 mb-4">{s.doctors} médico{s.doctors !== 1 ? 's' : ''} asignado{s.doctors !== 1 ? 's' : ''}</div>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm p-1.5" onClick={() => setSpecModal({ open: true, item: s })}><Edit3 size={13} /></button>
                <button
                  className="btn btn-ghost btn-sm p-1.5"
                  onClick={() => setSpecs(l => l.map(x => x.id === s.id ? { ...x, status: x.status === 'Activo' ? 'Inactivo' : 'Activo' } : x))}
                >
                  {s.status === 'Activo' ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-slate-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'services' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Servicio','Descripción','Precio','Duración','Estado','Acciones'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {svcs.map(s => (
                  <tr key={s.id} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{s.name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{s.description}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">${s.price.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{s.duration}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${s.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{s.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-sm p-1.5" onClick={() => setSvcModal({ open: true, item: s })}><Edit3 size={13} className="text-slate-500" /></button>
                        <button className="btn btn-ghost btn-sm p-1.5" onClick={() => setSvcs(l => l.map(x => x.id === s.id ? { ...x, status: x.status === 'Activo' ? 'Inactivo' : 'Activo' } : x))}>
                          {s.status === 'Activo' ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-slate-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {specModal.open && <SpecialtyModal spec={specModal.item} onClose={() => setSpecModal({ open: false })} />}
      {svcModal.open && <ServiceModal svc={svcModal.item} onClose={() => setSvcModal({ open: false })} />}
    </div>
  );
}
