import {useClinic,date,Row} from '../../context/Clinic';
import {PaymentForm} from '../../components/ManageForms';
import {Modal} from '../../components/ClinicalUI';
import { useState } from 'react';
import { Plus, Search, CreditCard, Banknote, Building2 } from 'lucide-react';


const methodIcon: Record<string, React.ReactNode> = {
  'Efectivo': <Banknote size={13} />,
  'Tarjeta': <CreditCard size={13} />,
  'Transferencia': <Building2 size={13} />,
};

const statusBadge: Record<string, string> = {
  'Pagado': 'bg-green-100 text-green-700',
  'Pendiente': 'bg-amber-100 text-amber-700',
  'Anulado': 'bg-red-100 text-red-700',
};

export default function Payments() {
 const {panel}=useClinic();const payments=panel.payments.map(p=>({id:`PAG-${String(p.id).padStart(3,'0')}`,patient:String(p.paciente),service:String(p.servicio),doctor:String(p.medico),date:date(p.fechaUtc),amount:Number(p.monto),method:String(p.metodo),status:String(p.estado)}));
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
 const [edit,setEdit]=useState<Row|undefined>();

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const ms = p.patient.toLowerCase().includes(q) || p.service.toLowerCase().includes(q);
    const mf = statusF === 'Todos' || p.status === statusF;
    return ms && mf;
  });

  const total = filtered.reduce((s, p) => p.status === 'Pagado' ? s + p.amount : s, 0);
  const pending=panel.appointments.filter(a=>!['Cancelada','No asistió'].includes(a.estado)).reduce((sum,a)=>sum+Math.max(0,Number(a.precio)-Number(a.pagado)),0);

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Pagos</h1>
          <p className="text-sm text-slate-500">Registro de cobros del consultorio</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={14} />
          Registrar pago
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Cobrado hoy', value: `$${total.toFixed(2)}`, color: 'text-green-600 bg-green-50' },
          { label: 'Pendiente', value: `$${pending.toFixed(2)}`, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total registros', value: filtered.length, color: 'text-slate-700 bg-slate-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <div className="text-xs text-current opacity-70 mb-1">{s.label}</div>
            <div className="text-xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {['Todos', 'Pagado', 'Pendiente', 'Anulado'].map(s => (
            <button key={s} className={`tab-btn ${statusF === s ? 'active' : ''}`} onClick={() => setStatusF(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Paciente', 'Servicio', 'Médico', 'Fecha', 'Monto', 'Método', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="table-row border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-400">{p.id}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{p.patient}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{p.service}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{p.doctor}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{p.date}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">${p.amount.toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      {methodIcon[p.method]}
                      {p.method}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${statusBadge[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="btn btn-ghost btn-sm text-blue-600 text-xs">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal&&<Modal title="Registrar pago" onClose={()=>setShowModal(false)}><PaymentForm  onClose={()=>setShowModal(false)}/></Modal>}
    </div>
  );
}
