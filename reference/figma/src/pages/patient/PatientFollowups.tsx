import { useNavigate } from 'react-router-dom';
import { Calendar, Activity } from 'lucide-react';

const followups = [
  { id: 1, doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', reason: 'Control de hipertensión arterial', recommended: '04 oct 2026', status: 'Pendiente' },
  { id: 2, doctor: 'Dr. Eduardo Vega', specialty: 'Cardiología', reason: 'Revisión de resultados lipídicos', recommended: '15 nov 2026', status: 'Programado' },
];

const statusBadge: Record<string, string> = {
  'Pendiente': 'bg-amber-100 text-amber-700',
  'Programado': 'bg-blue-100 text-blue-700',
  'Completado': 'bg-green-100 text-green-700',
  'Vencido': 'bg-red-100 text-red-700',
};

export default function PatientFollowups() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-screen-md">
      <h1 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mis seguimientos</h1>

      {followups.length === 0 ? (
        <div className="card p-12 text-center">
          <Activity size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No tienes seguimientos pendientes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {followups.map(f => (
            <div key={f.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Activity size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{f.reason}</span>
                    <span className={`badge text-xs ${statusBadge[f.status]}`}>{f.status}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {f.doctor} · {f.specialty}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Fecha recomendada: <strong className="text-slate-700">{f.recommended}</strong>
                  </div>
                </div>
                {['Pendiente', 'Vencido'].includes(f.status) && (
                  <button
                    className="btn btn-primary btn-sm flex-shrink-0"
                    onClick={() => navigate('/patient/book')}
                  >
                    <Calendar size={12} />
                    Agendar cita
                  </button>
                )}
                {f.status === 'Programado' && (
                  <button className="btn btn-secondary btn-sm flex-shrink-0" onClick={() => navigate('/patient/appointments')}>
                    Ver cita
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
