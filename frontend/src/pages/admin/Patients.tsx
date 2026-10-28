import PatientPhoto from '../../components/PatientPhoto';
import {useClinic,date,age} from '../../context/Clinic';
import { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Eye, Edit3, UserX, Phone, Mail } from 'lucide-react';


export default function Patients() {
  const navigate = useNavigate();const {panel,session,mutate}=useClinic();
  const patients=panel.patients.map(p=>({id:p.id,code:`PAC-${String(p.id).padStart(3,'0')}`,name:String(p.nombre),age:age(p.fechaNacimiento),phone:p.telefono||'—',email:String(p.correo||''),lastVisit:date(p.ultimaConsulta),status:p.activo?'Activo':'Inactivo',specialty:String(p.documento)}));
  const staff=session.rol==='Administrador'||session.rol==='Recepcionista';
  async function toggle(id:number,active:boolean){if(!window.confirm(active?'¿Desactivar este paciente?':'¿Activar este paciente?'))return;try{await mutate(`/pacientes/${id}/activo`,{activo:!active},'PATCH');}catch{}}

  const [search, setSearch] = useState(new URLSearchParams(window.location.search).get('q')||'');
  const location=useLocation();useEffect(()=>{setSearch(new URLSearchParams(location.search).get('q')||'');setPage(1);},[location.search]);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'Todos' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const perPage = 8;
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const displayed = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Pacientes</h1>
          <p className="text-sm text-slate-500">{total} pacientes registrados</p>
        </div>
        <button className="btn btn-primary btn-sm" disabled={!staff} onClick={() => navigate('/admin/patients/new')}>
          <Plus size={14} />
          Nuevo paciente
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre, código o correo..."
              className="bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 w-full"
            />
          </div>
          <div className="flex gap-2">
            {['Todos', 'Activo', 'Inactivo'].map(s => (
              <button
                key={s}
                className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={()=>{setSearch('');setStatusFilter('Todos');setPage(1);}}>
            <Filter size={13} />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Código', 'Paciente', 'Edad', 'Teléfono', 'Correo', 'Última consulta', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="text-slate-400 text-sm">No existen pacientes con estos filtros.</div>
                  </td>
                </tr>
              ) : displayed.map(p => (
                <tr key={p.code} className="table-row border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.code}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <PatientPhoto patient={panel.patients.find(record=>record.id===p.id)!} compact/>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.specialty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{p.age} años</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone size={12} className="text-slate-400" />
                      {p.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Mail size={12} className="text-slate-400" />
                      <span className="truncate max-w-[140px]">{p.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{p.lastVisit}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${p.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        title="Ver expediente"
                        className="btn btn-ghost btn-sm p-1.5"
                        onClick={() => navigate(`/admin/patients/record?id=${p.id}`)}
                      >
                        <Eye size={14} className="text-blue-600" />
                      </button>
                      <button disabled={!staff} title="Editar" className="btn btn-ghost btn-sm p-1.5" onClick={()=>navigate(`/admin/patients/new?id=${p.id}`)}>
                        <Edit3 size={14} className="text-slate-500" />
                      </button>
                      <button disabled={!staff} title={p.status==='Activo'?'Desactivar':'Activar'} className="btn btn-ghost btn-sm p-1.5" onClick={()=>toggle(p.id,p.status==='Activo')}>
                        <UserX size={14} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Mostrando {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} de {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="btn btn-ghost btn-sm p-1.5"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`w-7 h-7 rounded-md text-xs font-medium ${n === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="btn btn-ghost btn-sm p-1.5"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
