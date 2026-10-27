type SpecialtyRow={id:number;name:string;description:string;doctors:number;status:string};
type ServiceRow={id:number;name:string;description:string;price:number;duration:string;status:string};
import {useClinic} from '../../context/Clinic';
import { useState } from 'react';
import { Plus, Edit3, ToggleLeft, ToggleRight, X } from 'lucide-react';



function SpecialtyModal({ spec, onClose }: { spec?: SpecialtyRow; onClose: () => void }) {
  const {mutate}=useClinic();const [error,setError]=useState('');
  const [name, setName] = useState(spec?.name ?? '');
  const [desc, setDesc] = useState(spec?.description ?? '');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{spec ? 'Editar especialidad' : 'Nueva especialidad'}</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">{error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input className="input-field" maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Neurología" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea className="input-field resize-none" maxLength={500} rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción breve..." />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={async()=>{try{await mutate(spec?`/especialidades/${spec.id}`:'/especialidades',{nombre:name,descripcion:desc},spec?'PUT':'POST');onClose();}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo guardar.');}}}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function ServiceModal({ svc, onClose }: { svc?: ServiceRow; onClose: () => void }) {
  const {mutate}=useClinic();const [error,setError]=useState('');
  const [form, setForm] = useState({ name: svc?.name ?? '', desc: svc?.description ?? '', price: svc?.price?.toString() ?? '', duration: svc?.duration ?? '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{svc ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">{error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
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
          <button className="btn btn-primary flex-1" onClick={async()=>{try{if(!/^\d+(?:\s*min)?$/.test(form.duration.trim()))throw new Error('Indique la duración en minutos, por ejemplo 30 min.');await mutate(svc?`/servicios/${svc.id}/detalle`:'/servicios/detalle',{nombre:form.name,descripcion:form.desc,precio:Number(form.price),duracionMinutos:parseInt(form.duration)},svc?'PUT':'POST');onClose();}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo guardar.');}}}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default function Specialties() {
  const [tab, setTab] = useState<'specialties' | 'services'>('specialties');
  const {panel,mutate}=useClinic();
  const specs:SpecialtyRow[]=panel.specialties.map(s=>({id:s.id,name:String(s.nombre),description:String(s.descripcion),doctors:panel.doctors.filter(d=>d.especialidad===s.nombre).length,status:s.activa?'Activo':'Inactivo'}));
  const svcs:ServiceRow[]=panel.services.map(s=>({id:s.id,name:String(s.nombre),description:String(s.descripcion),price:Number(s.precio),duration:s.duracionMinutos+' min',status:s.activo?'Activo':'Inactivo'}));
  async function toggle(type:string,id:number,active:boolean){try{await mutate(`/${type}/${id}/activo`,{activo:!active},'PATCH');}catch{}}

  const [specModal, setSpecModal] = useState<{ open: boolean; item?: SpecialtyRow }>({ open: false });
  const [svcModal, setSvcModal] = useState<{ open: boolean; item?: ServiceRow }>({ open: false });

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
                  onClick={() => toggle('especialidades',s.id,s.status==='Activo')}
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
                        <button className="btn btn-ghost btn-sm p-1.5" onClick={() => toggle('servicios',s.id,s.status==='Activo')}>
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
