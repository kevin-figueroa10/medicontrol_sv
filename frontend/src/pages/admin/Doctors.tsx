type DoctorRow={id:number;usuarioId:number;code:string;name:string;specialty:string;jvpm:string;phone:string;email:string;schedule:string;status:string;horarios:{diaSemana:number;desde:string;hasta:string}[]};
import {useClinic,Row} from '../../context/Clinic';
import { useState } from 'react';
import { Plus, Search, Eye, Edit3, UserX, UserCheck, X, AlertCircle } from 'lucide-react';


interface ModalProps { mode: 'new' | 'edit' | 'view'; doctor?: DoctorRow; onClose: () => void; }

function DoctorModal({ mode, doctor, onClose }: ModalProps) {
 const {panel,mutate,busy}=useClinic();const [usuarioId,setUsuarioId]=useState(String(doctor?.usuarioId||''));const [failure,setFailure]=useState('');const [days,setDays]=useState<number[]>(doctor?.horarios.length?doctor.horarios.map(h=>h.diaSemana):[1,2,3,4,5]);const [from,setFrom]=useState(doctor?.horarios[0]?.desde.slice(0,5)||'08:00'),[to,setTo]=useState(doctor?.horarios[0]?.hasta.slice(0,5)||'17:00');
  const [form, setForm] = useState({
    name: doctor?.name ?? '', specialty: doctor?.specialty ?? '', jvpm: doctor?.jvpm ?? '',
    phone: doctor?.phone ?? '', email: doctor?.email ?? '', schedule: doctor?.schedule ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Obligatorio';
    if (!form.specialty) e.specialty = 'Obligatorio';
    if (!form.jvpm) e.jvpm = 'Obligatorio';if(!usuarioId)e.usuario='Seleccione una cuenta de médico';if(!days.length||from>=to)e.schedule='Seleccione días y un rango de horas válido';
    setErrors(e);
    if (Object.keys(e).length === 0)try{await mutate(mode==='edit'?`/medicos/${doctor!.id}/detalle`:'/medicos',{nombre:form.name,especialidad:form.specialty,jvpm:form.jvpm,usuarioId:Number(usuarioId),telefono:form.phone,horario:days.map(d=>['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d]).join(', ')+` ${from}-${to}`,horarios:days.map(d=>({diaSemana:d,desde:from+':00',hasta:to+':00'}))},mode==='edit'?'PUT':'POST');onClose();}catch(ex){setFailure(ex instanceof Error?ex.message:'No se pudo guardar.');}
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

        <div className="space-y-4">{failure&&<p role="alert" className="text-red-700 text-sm">{failure}</p>}<div><label className="block text-sm font-medium text-slate-700 mb-1">Cuenta de usuario médico</label><select required disabled={readOnly} className="input-field" value={usuarioId} onChange={e=>{setUsuarioId(e.target.value);const u=panel.users.find(u=>u.id===Number(e.target.value));setForm(p=>({...p,name:p.name||u?.nombre||'',email:u?.correo||''}));}}><option value="">Seleccione una cuenta…</option>{panel.users.filter(u=>u.rol==='Medico'&&u.activo&&(!panel.doctors.some(d=>d.usuarioId===u.id)||u.id===doctor?.usuarioId)).map(u=><option key={u.id} value={u.id}>{u.nombre} · {u.correo}</option>)}</select>{errors.usuario&&<p className="text-red-700 text-xs">{errors.usuario}</p>}<p className="text-xs text-slate-500 mt-1">Cree primero la cuenta con rol Médico en Usuarios.</p></div>
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
                value={f.key==='schedule'?days.map(d=>['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d]).join(', ')+` ${from}-${to}`:(form as any)[f.key]}
                onChange={set(f.key)}
                readOnly={readOnly||f.key==='email'||f.key==='schedule'} maxLength={f.key==='jvpm'?50:f.key==='phone'?20:f.key==='schedule'?200:160}
                style={readOnly ? { background: '#f8fafc' } : {}}
              />
              {errors[f.key] && <div className="flex items-center gap-1 mt-1 text-red-600 text-xs"><AlertCircle size={11} />{errors[f.key]}</div>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Especialidad</label>
            <select className="input-field" value={form.specialty} onChange={set('specialty')} disabled={readOnly}>
              <option value="">Seleccionar...</option>
              {[...new Set([...panel.specialties.filter(s=>s.activa).map(s=>String(s.nombre)),...panel.doctors.map(d=>String(d.especialidad))])].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {errors.specialty && <div className="flex items-center gap-1 mt-1 text-red-600 text-xs"><AlertCircle size={11} />{errors.specialty}</div>}
          </div>
        </div>

        <div className="space-y-3 mt-4"><div className="flex flex-wrap gap-3">{['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((label,i)=><label key={label} className="flex gap-1 text-xs"><input type="checkbox" checked={days.includes(i)} disabled={readOnly} onChange={e=>setDays(p=>e.target.checked?[...p,i].sort():p.filter(d=>d!==i))}/>{label}</label>)}</div><div className="grid grid-cols-2 gap-4"><label className="text-sm">Desde<input className="input-field" type="time" value={from} disabled={readOnly} onChange={e=>setFrom(e.target.value)}/></label><label className="text-sm">Hasta<input className="input-field" type="time" value={to} disabled={readOnly} onChange={e=>setTo(e.target.value)}/></label></div></div><div className="flex gap-3 mt-6">
          <button className="btn btn-secondary flex-1" onClick={onClose}>{readOnly ? 'Cerrar' : 'Cancelar'}</button>
          {!readOnly && <button className="btn btn-primary flex-1" disabled={busy} onClick={handleSave}>Guardar</button>}
        </div>
      </div>
    </div>
  );
}

export default function Doctors() {
  const {panel,mutate}=useClinic();
  const list:DoctorRow[]=panel.doctors.map(d=>({id:d.id,usuarioId:d.usuarioId,code:`MED-${String(d.id).padStart(3,'0')}`,name:String(d.nombre),specialty:String(d.especialidad),jvpm:String(d.jvpm),phone:String(d.telefono||'—'),email:String(d.correo||''),schedule:String(d.horario||'—'),status:d.activo?'Activo':'Inactivo',horarios:d.horarios||[]}));
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('Todos');
  const [modal, setModal] = useState<{ mode: 'new'|'edit'|'view'; doctor?: DoctorRow } | null>(null);

  const filtered = list.filter(d => {
    const q = search.toLowerCase();
    return (
      (d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)) &&
      (statusF === 'Todos' || d.status === statusF)
    );
  });

  const toggle=async(code:string)=>{const d=list.find(d=>d.code===code);if(!d||!window.confirm(d.status==='Activo'?'¿Desactivar médico?':'¿Activar médico?'))return;try{await mutate(`/medicos/${d.id}/activo`,{activo:d.status!=='Activo'},'PATCH');}catch{}};

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
              {!filtered.length&&<tr><td colSpan={9} className="p-8 text-center text-sm text-slate-500">No hay médicos registrados con estos filtros.</td></tr>}{filtered.map(d => (
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
