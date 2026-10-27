import { useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle, Activity, Play, FileText } from 'lucide-react';

const todayAppts = [
  { time: '08:00', patient: 'Diego Cruz', age: 52, reason: 'Primera consulta cardiológica', status: 'Finalizada' },
  { time: '09:00', patient: 'Carlos Mendoza', age: 45, reason: 'Control de hipertensión', status: 'En espera' },
  { time: '09:30', patient: 'María García', age: 32, reason: 'Dolor de cabeza persistente', status: 'En consulta' },
  { time: '10:30', patient: 'Sofía Torres', age: 36, reason: 'Dolor en el pecho', status: 'Confirmada' },
  { time: '14:00', patient: 'Luis Hernández', age: 41, reason: 'Seguimiento cardíaco', status: 'Confirmada' },
  { time: '15:00', patient: 'Marco Vásquez', age: 63, reason: 'Revisión de resultados', status: 'Confirmada' },
];

const statusColor: Record<string, string> = {
  'Confirmada': 'bg-blue-100 text-blue-700',
  'En espera': 'bg-amber-100 text-amber-700',
  'En consulta': 'bg-purple-100 text-purple-700',
  'Finalizada': 'bg-green-100 text-green-700',
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const attended = todayAppts.filter(a => a.status === 'Finalizada').length;
  const pending = todayAppts.filter(a => ['En espera', 'Confirmada'].includes(a.status)).length;
  const inConsult = todayAppts.filter(a => a.status === 'En consulta').length;

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="mb-6">
        <div className="text-sm text-slate-500 mb-1">Domingo, 13 de septiembre de 2026</div>
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Buenos días, Dr. Vega</h1>
        <p className="text-sm text-slate-500">Tienes {todayAppts.length} pacientes programados para hoy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pacientes hoy', value: todayAppts.length, icon: <Users size={18} />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Pendientes', value: pending, icon: <Clock size={18} />, color: 'bg-amber-50 text-amber-600' },
          { label: 'Atendidos', value: attended, icon: <CheckCircle size={18} />, color: 'bg-green-50 text-green-600' },
          { label: 'En consulta', value: inConsult, icon: <Activity size={18} />, color: 'bg-purple-50 text-purple-600' },
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

      {/* Today's appointments */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mis citas de hoy</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {todayAppts.map((a, i) => (
            <div key={i} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 text-center">
                <div className="text-lg font-bold text-slate-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>{a.time}</div>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {a.patient.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{a.patient}</div>
                  <div className="text-xs text-slate-500">{a.age} años · {a.reason}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${statusColor[a.status]}`}>{a.status}</span>
                {['En espera', 'Confirmada'].includes(a.status) && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/doctor/consultation')}
                  >
                    <Play size={12} />
                    Iniciar consulta
                  </button>
                )}
                {a.status === 'En consulta' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/doctor/consultation')}
                  >
                    <FileText size={12} />
                    Ver consulta
                  </button>
                )}
                {a.status === 'Finalizada' && (
                  <button className="btn btn-ghost btn-sm text-slate-500">
                    <FileText size={12} />
                    Ver resumen
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
