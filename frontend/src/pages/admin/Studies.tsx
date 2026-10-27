import {useClinic,date,day,Row,download} from '../../context/Clinic';
import {Modal,Field} from '../../components/ClinicalUI';
import {ClinicalOrderForm,ActionForm} from '../../components/ManageForms';
import { useState } from 'react';
import { Plus, Search, FileText, Download, Eye } from 'lucide-react';


const statusBadge: Record<string, string> = {
  'Solicitado': 'bg-slate-100 text-slate-600',
  'Pendiente': 'bg-amber-100 text-amber-700',
  'Resultado disponible': 'bg-blue-100 text-blue-700',
  'Revisado': 'bg-green-100 text-green-700',
};

export default function Studies() {
 const {panel,session,mutate}=useClinic();const doctor=session.rol==='Medico';const patient=session.rol==='Paciente';const [selected,setSelected]=useState<Row|null>(null),[result,setResult]=useState('');const studies=panel.studies.map(s=>({id:s.id,patient:String(s.paciente),study:String(s.tipo),doctor:String(s.medico),date:date(s.fechaUtc),status:String(s.estado),result:s.resultado?.descripcion||'',notes:s.indicaciones}));
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
        <button disabled={!doctor} className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
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
              {!filtered.length&&<tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">No hay registros.</td></tr>}{filtered.map(s => (
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
                          <button aria-label="Ver resultado" className="btn btn-ghost btn-sm p-1.5 text-blue-600" onClick={()=>{setSelected(panel.studies.find(x=>x.id===s.id)||null);setResult(s.result);}}><Eye size={13} /></button>
                          <button aria-label="Descargar resultado" className="btn btn-ghost btn-sm p-1.5 text-slate-500" onClick={()=>download(`estudio-${s.id}.txt`,`${s.patient}\n${s.study}\n${s.result}`)}><Download size={13} /></button>
                        </>
                      )}
                      <button aria-label="Ver orden" className="btn btn-ghost btn-sm p-1.5 text-slate-500" onClick={()=>{setSelected(panel.studies.find(x=>x.id===s.id)||null);setResult(s.result);}}><FileText size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal&&<Modal title="Solicitar estudio médico" onClose={()=>setShowModal(false)}><ClinicalOrderForm kind="study" onClose={()=>setShowModal(false)}/></Modal>}
      {selected&&<Modal title={selected.tipo} onClose={()=>setSelected(null)}><p className="text-sm text-slate-500 mb-3">{selected.paciente} · {selected.medico}</p><p className="text-sm mb-4">{selected.indicaciones||'Sin indicaciones adicionales.'}</p>{selected.resultado?<><div className="p-4 rounded-xl bg-slate-50 whitespace-pre-wrap text-sm">{selected.resultado.descripcion}</div>{doctor&&!selected.resultado.revisado&&<button className="btn btn-primary mt-4" onClick={async()=>{try{await mutate(`/estudios/${selected.id}/revisar`,undefined,'PATCH');setSelected(null);}catch{}}}>Marcar como revisado</button>}</>:doctor?<ActionForm onClose={()=>setSelected(null)} label="Guardar resultado" onSave={async()=>{await mutate(`/estudios/${selected.id}/resultado`,{descripcion:result});}}><Field label="Descripción del resultado"><textarea required maxLength={2500} className="input-field" rows={5} value={result} onChange={e=>setResult(e.target.value)}/></Field></ActionForm>:<p className="text-sm text-slate-500">Aún no se ha registrado un resultado.</p>}</Modal>}
    </div>);
}
