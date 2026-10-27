import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, Play, UserCheck, RefreshCw } from 'lucide-react';

const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
  confirmed: { label: 'Confirmado', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  arrived: { label: 'Llegó', badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  waiting: { label: 'En espera', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  in_consult: { label: 'En consulta', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  attended: { label: 'Atendido', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

const initial = [
  { id: 1, apptTime: '09:00', patient: 'Carlos Mendoza', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', arrival: '08:52', waitMins: 28, status: 'waiting' },
  { id: 2, apptTime: '09:30', patient: 'María García', doctor: 'Dra. Patricia López', specialty: 'Med. General', arrival: '09:25', waitMins: 8, status: 'arrived' },
  { id: 3, apptTime: '10:00', patient: 'Ana Martínez', doctor: 'Dr. Carlos Torres', specialty: 'Pediatría', arrival: '09:55', waitMins: 0, status: 'in_consult' },
  { id: 4, apptTime: '10:30', patient: 'Roberto Flores', doctor: 'Dra. Patricia López', specialty: 'Med. General', arrival: '—', waitMins: 0, status: 'confirmed' },
  { id: 5, apptTime: '11:00', patient: 'Sofía Torres', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', arrival: '10:48', waitMins: 15, status: 'waiting' },
  { id: 6, apptTime: '11:30', patient: 'Luis Hernández', doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', arrival: '—', waitMins: 0, status: 'confirmed' },
  { id: 7, apptTime: '08:30', patient: 'Diego Cruz', doctor: 'Dr. Carlos Torres', specialty: 'Pediatría', arrival: '08:25', waitMins: 0, status: 'attended' },
];

export default function WaitingRoom() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(initial);

  const updateStatus = (id: number, newStatus: string) => {
    setPatients(ps => ps.map(p => {
      if (p.id !== id) return p;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
      return {
        ...p,
        status: newStatus,
        arrival: newStatus === 'arrived' ? timeStr : p.arrival,
      };
    }));
  };

  const waiting = patients.filter(p => ['waiting', 'arrived'].includes(p.status));
  const inConsult = patients.filter(p => p.status === 'in_consult');
  const attended = patients.filter(p => p.status === 'attended');

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Sala de espera digital</h1>
          <p className="text-sm text-slate-500">Domingo, 13 de septiembre de 2026 · Actualizado en tiempo real</p>
        </div>
        <button className="btn btn-secondary btn-sm">
          <RefreshCw size={13} />
          Actualizar
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'En espera', value: waiting.length, icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'En consulta', value: inConsult.length, icon: <Play size={18} />, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Atendidos', value: attended.length, icon: <CheckCircle size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Confirmados', value: patients.filter(p => p.status === 'confirmed').length, icon: <UserCheck size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(c => (
          <div key={c.label} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}>{c.icon}</div>
            <div>
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{c.value}</div>
              <div className="text-xs text-slate-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Pacientes del día</h2>
          <div className="flex gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-500" /> Espera larga (&gt;20 min)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Cita', 'Paciente', 'Médico', 'Llegada', 'Tiempo espera', 'Estado', 'Acción'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map(p => {
                const sc = statusConfig[p.status];
                const longWait = p.waitMins >= 20 && p.status === 'waiting';
                return (
                  <tr key={p.id} className={`table-row border-b border-slate-50 last:border-0 ${longWait ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{p.apptTime}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {p.patient.split(' ').map(n=>n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                            {p.patient}
                            {longWait && <AlertTriangle size={12} className="text-amber-500" />}
                          </div>
                          <div className="text-xs text-slate-400">{p.specialty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{p.doctor}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{p.arrival}</td>
                    <td className="px-5 py-3.5">
                      {p.waitMins > 0 ? (
                        <span className={`text-sm font-medium ${p.waitMins >= 20 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {p.waitMins} min
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">–</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                        <span className={`badge ${sc.badge}`}>{sc.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        {p.status === 'confirmed' && (
                          <button
                            className="btn btn-secondary btn-sm text-indigo-600"
                            onClick={() => updateStatus(p.id, 'arrived')}
                          >
                            <UserCheck size={12} />
                            Registrar llegada
                          </button>
                        )}
                        {p.status === 'arrived' && (
                          <button
                            className="btn btn-secondary btn-sm text-amber-600"
                            onClick={() => updateStatus(p.id, 'waiting')}
                          >
                            <Clock size={12} />
                            Pasar a espera
                          </button>
                        )}
                        {p.status === 'waiting' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => { updateStatus(p.id, 'in_consult'); navigate('/doctor/consultation'); }}
                          >
                            <Play size={12} />
                            Iniciar consulta
                          </button>
                        )}
                        {p.status === 'in_consult' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateStatus(p.id, 'attended')}
                          >
                            <CheckCircle size={12} />
                            Finalizar
                          </button>
                        )}
                        {p.status === 'attended' && (
                          <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Atendido</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
