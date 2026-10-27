import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Users, Plus, UserCheck, Search, Play } from 'lucide-react';

const todayAppts = [
  { time: '09:00', patient: 'Carlos Mendoza', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', status: 'En espera' },
  { time: '09:30', patient: 'María García', doctor: 'Dra. Patricia López', specialty: 'Med. General', status: 'En consulta' },
  { time: '10:00', patient: 'Ana Martínez', doctor: 'Dr. Carlos Torres', specialty: 'Pediatría', status: 'Confirmada' },
  { time: '10:30', patient: 'Roberto Flores', doctor: 'Dra. Patricia López', specialty: 'Med. General', status: 'Confirmada' },
  { time: '11:00', patient: 'Sofía Torres', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', status: 'Confirmada' },
  { time: '14:00', patient: 'Luis Hernández', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', status: 'Confirmada' },
];

const statusBadge: Record<string, string> = {
  'Confirmada': 'bg-blue-100 text-blue-700',
  'En espera': 'bg-amber-100 text-amber-700',
  'En consulta': 'bg-purple-100 text-purple-700',
  'Finalizada': 'bg-green-100 text-green-700',
};

export default function ReceptionistDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <p className="text-sm text-slate-500">Domingo, 13 de septiembre de 2026</p>
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Recepción – Bienvenida, María</h1>
        <p className="text-sm text-slate-500">Tienes {todayAppts.length} citas programadas para hoy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Citas hoy', value: todayAppts.length, icon: <Calendar size={18} />, color: 'bg-blue-50 text-blue-600' },
          { label: 'En espera', value: todayAppts.filter(a => a.status === 'En espera').length, icon: <Clock size={18} />, color: 'bg-amber-50 text-amber-600' },
          { label: 'En consulta', value: todayAppts.filter(a => a.status === 'En consulta').length, icon: <Play size={18} />, color: 'bg-purple-50 text-purple-600' },
          { label: 'Atendidos', value: 1, icon: <CheckCircle size={18} />, color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Nueva cita', icon: <Plus size={18} />, color: 'bg-blue-600 text-white hover:bg-blue-700', path: '/admin/book' },
          { label: 'Nuevo paciente', icon: <Users size={18} />, color: 'bg-indigo-600 text-white hover:bg-indigo-700', path: '/admin/patients/new' },
          { label: 'Registrar llegada', icon: <UserCheck size={18} />, color: 'bg-amber-500 text-white hover:bg-amber-600', path: '/admin/waiting-room' },
          { label: 'Buscar paciente', icon: <Search size={18} />, color: 'bg-slate-700 text-white hover:bg-slate-800', path: '/admin/patients' },
        ].map(a => (
          <button
            key={a.label}
            className={`${a.color} rounded-xl p-4 flex flex-col items-center gap-2 text-sm font-medium transition-colors`}
            onClick={() => navigate(a.path)}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Citas del día</h2>
          <button className="btn btn-ghost btn-sm text-blue-600" onClick={() => navigate('/admin/agenda')}>Ver agenda</button>
        </div>
        <div className="divide-y divide-slate-50">
          {todayAppts.map((a, i) => (
            <div key={i} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-14 text-base font-bold text-slate-700" style={{ fontFamily: 'DM Sans, sans-serif' }}>{a.time}</div>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {a.patient.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{a.patient}</div>
                  <div className="text-xs text-slate-500">{a.doctor} · {a.specialty}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${statusBadge[a.status] || 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                {a.status === 'Confirmada' && (
                  <button className="btn btn-secondary btn-sm text-xs" onClick={() => navigate('/admin/waiting-room')}>
                    <UserCheck size={11} /> Registrar llegada
                  </button>
                )}
                {a.status === 'En espera' && (
                  <button className="btn btn-primary btn-sm text-xs" onClick={() => navigate('/admin/waiting-room')}>
                    Ver sala
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
