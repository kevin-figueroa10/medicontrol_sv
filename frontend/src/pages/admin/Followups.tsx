import {useClinic,date,day,Row,download} from '../../context/Clinic';
import {Modal,Field} from '../../components/ClinicalUI';
import {ClinicalOrderForm,ActionForm} from '../../components/ManageForms';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, X, CheckCircle } from 'lucide-react';


const statusBadge: Record<string, string> = {
  'Pendiente': 'bg-amber-100 text-amber-700',
  'Programado': 'bg-blue-100 text-blue-700',
  'Completado': 'bg-green-100 text-green-700',
  'Vencido': 'bg-red-100 text-red-700',
};

export default function Followups() {
 const {panel,session,mutate}=useClinic();const doctor=session.rol==='Medico';const patient=session.rol==='Paciente';const [selected,setSelected]=useState<Row|null>(null),[result,setResult]=useState('');const followups=panel.followups.map(f=>({id:f.id,patient:String(f.paciente),doctor:String(f.medico),lastConsult:date(f.ultimaConsulta),reason:String(f.motivo),recommended:date(f.fecha),status:f.estado==='Pendiente'&&f.fecha<day()?'Vencido':String(f.estado)}));
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
        <button disabled={!doctor} className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
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
              {!filtered.length&&<tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">No hay registros.</td></tr>}{filtered.map(f => (
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
                    <div className="flex gap-1.5">{doctor&&<button className="btn btn-secondary btn-sm" onClick={()=>setSelected(panel.followups.find(x=>x.id===f.id)||null)}>Actualizar</button>}{patient&&f.status!=='Completado'&&<button className="btn btn-primary btn-sm" onClick={()=>navigate('/patient/book')}>Agendar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New followup modal */}
      {showModal&&<Modal title="Nuevo seguimiento" onClose={()=>setShowModal(false)}><ClinicalOrderForm kind="followup" onClose={()=>setShowModal(false)}/></Modal>}
      {selected&&<Modal title="Actualizar seguimiento" onClose={()=>setSelected(null)}><p className="text-sm mb-4">{selected.paciente} · {selected.motivo}</p><ActionForm onClose={()=>setSelected(null)} onSave={async()=>{const [estado,citaId]=result.split(':');if(!estado)throw new Error('Seleccione un estado.');await mutate(`/seguimientos/${selected.id}/estado`,{estado,citaId:citaId?Number(citaId):null},'PATCH');}}><Field label="Estado / cita"><select required className="input-field" value={result} onChange={e=>setResult(e.target.value)}><option value="">Seleccionar…</option><option value="Pendiente">Pendiente</option><option value="Completado">Completado</option>{panel.appointments.filter(a=>a.pacienteId===selected.pacienteId&&!['Cancelada','No asistió'].includes(a.estado)).map(a=><option key={a.id} value={`Programado:${a.id}`}>Programado · Cita #{a.id} · {date(a.inicio,true)}</option>)}</select></Field></ActionForm></Modal>}
    </div>);
}
