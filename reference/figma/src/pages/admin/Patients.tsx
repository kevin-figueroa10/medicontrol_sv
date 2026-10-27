import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Eye, Edit3, UserX, Phone, Mail } from 'lucide-react';

const patients = [
  { code: 'PAC-001', name: 'Carlos Alberto Mendoza', age: 45, phone: '7654-3210', email: 'carlos@email.com', lastVisit: '10 sep 2026', status: 'Activo', specialty: 'Cardiología' },
  { code: 'PAC-002', name: 'María Elena García', age: 32, phone: '7891-0234', email: 'maria@email.com', lastVisit: '08 sep 2026', status: 'Activo', specialty: 'Med. General' },
  { code: 'PAC-003', name: 'Roberto Flores Díaz', age: 58, phone: '7123-4567', email: 'roberto@email.com', lastVisit: '05 sep 2026', status: 'Activo', specialty: 'Cardiología' },
  { code: 'PAC-004', name: 'Ana Lucía Martínez', age: 27, phone: '7456-7890', email: 'ana@email.com', lastVisit: '03 sep 2026', status: 'Activo', specialty: 'Ginecología' },
  { code: 'PAC-005', name: 'Luis Fernando Hernández', age: 41, phone: '7890-1234', email: 'luis@email.com', lastVisit: '28 ago 2026', status: 'Activo', specialty: 'Dermatología' },
  { code: 'PAC-006', name: 'Sofía Isabel Torres', age: 36, phone: '7234-5678', email: 'sofia@email.com', lastVisit: '25 ago 2026', status: 'Activo', specialty: 'Med. General' },
  { code: 'PAC-007', name: 'Diego Alejandro Cruz', age: 52, phone: '7567-8901', email: 'diego@email.com', lastVisit: '20 ago 2026', status: 'Inactivo', specialty: 'Cardiología' },
  { code: 'PAC-008', name: 'Valentina López Ramos', age: 24, phone: '7901-2345', email: 'valentina@email.com', lastVisit: '18 ago 2026', status: 'Activo', specialty: 'Pediatría' },
  { code: 'PAC-009', name: 'Marco Antonio Vásquez', age: 63, phone: '7345-6789', email: 'marco@email.com', lastVisit: '15 ago 2026', status: 'Activo', specialty: 'Cardiología' },
  { code: 'PAC-010', name: 'Isabella Ramírez Ortiz', age: 19, phone: '7678-9012', email: 'isabella@email.com', lastVisit: '12 ago 2026', status: 'Activo', specialty: 'Med. General' },
];

export default function Patients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
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
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/patients/new')}>
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
          <button className="btn btn-secondary btn-sm">
            <Filter size={13} />
            Más filtros
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
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
                        onClick={() => navigate('/admin/patients/record')}
                      >
                        <Eye size={14} className="text-blue-600" />
                      </button>
                      <button title="Editar" className="btn btn-ghost btn-sm p-1.5">
                        <Edit3 size={14} className="text-slate-500" />
                      </button>
                      <button title="Desactivar" className="btn btn-ghost btn-sm p-1.5">
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
              disabled={page === totalPages}
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
