import {useClinic,date,Row} from '../../context/Clinic';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, FlaskConical, Activity, ChevronRight, Clock, MapPin, User } from 'lucide-react';

export default function PatientPortal() {
  const navigate = useNavigate();const {panel,session}=useClinic();const appointments=panel.appointments.filter(a=>new Date(a.inicio)>new Date()&&!['Cancelada','No asistió'].includes(a.estado));const next=appointments[0];const recipes=panel.prescriptions.filter(r=>!r.anulada);


  return (
    <div className="p-6 max-w-screen-lg">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          ¡Hola, {session.nombre.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 text-sm">{date(new Date().toISOString())}</p>
      </div>

      {/* Next appointment highlight */}
      <div
        className="rounded-2xl p-6 mb-6 text-white"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">Próxima cita</div>
            <div className="text-xl font-bold mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {next?.servicio||'No tienes citas próximas'}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-blue-100 mt-2">
              <span className="flex items-center gap-1.5"><Calendar size={13} /> {date(next?.inicio)}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} /> {next?new Date(next.inicio).toLocaleTimeString('es-SV',{hour:'2-digit',minute:'2-digit'}):'—'}</span>
              <span className="flex items-center gap-1.5"><User size={13} /> {next?.medico||'—'}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {panel.clinic?.nombre||'Consultorio'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={!next} className="btn bg-white/20 text-white hover:bg-white/30 btn-sm border border-white/30" onClick={()=>navigate('/patient/appointments')}>
              Reprogramar
            </button>
            <button disabled={!next} className="btn bg-white text-blue-700 hover:bg-blue-50 btn-sm font-semibold" onClick={()=>navigate('/patient/appointments')}>
              Ver detalles
            </button>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Próximas citas', value: appointments.length, icon: <Calendar size={20} />, color: 'bg-blue-50 text-blue-600', path: '/patient/appointments' },
          { label: 'Recetas disponibles', value: recipes.length, icon: <FileText size={20} />, color: 'bg-green-50 text-green-600', path: '/patient/prescriptions' },
          { label: 'Estudios', value: panel.studies.length, icon: <FlaskConical size={20} />, color: 'bg-amber-50 text-amber-600', path: '/patient/studies' },
          { label: 'Seguimientos', value: panel.followups.filter(f=>f.estado!=='Completado').length, icon: <Activity size={20} />, color: 'bg-purple-50 text-purple-600', path: '/patient/followups' },
        ].map(c => (
          <button
            key={c.label}
            className="card p-4 text-left hover:shadow-md transition-shadow"
            onClick={() => navigate(c.path)}
          >
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>{c.icon}</div>
            <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{c.value}</div>
            <div className="text-xs text-slate-500">{c.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* My appointments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mis citas</h2>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-1" onClick={() => navigate('/patient/appointments')}>
              Ver todas <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {appointments.slice(0,3).map(a=>({date:new Date(a.inicio).toLocaleDateString('es-SV',{day:'2-digit',month:'short'}),time:new Date(a.inicio).toLocaleTimeString('es-SV',{hour:'2-digit',minute:'2-digit'}),doctor:String(a.medico),specialty:String(a.especialidad),status:String(a.estado)})).map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="text-center bg-blue-600 text-white rounded-xl px-3 py-2 flex-shrink-0">
                  <div className="text-xs font-medium">{a.date.split(' ')[1]}</div>
                  <div className="text-base font-bold leading-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>{a.date.split(' ')[0]}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{a.doctor}</div>
                  <div className="text-xs text-slate-500">{a.specialty} · {a.time}</div>
                </div>
                <span className={`badge text-xs ${a.status === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
              </div>
            ))}
            <button
              className="w-full py-2 text-sm text-blue-600 font-medium bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              onClick={() => navigate('/patient/book')}
            >
              + Agendar nueva cita
            </button>
          </div>
        </div>

        {/* My prescriptions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mis recetas recientes</h2>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-1" onClick={() => navigate('/patient/prescriptions')}>
              Ver todas <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recipes.slice(0,3).map(r=>({date:date(r.fechaUtc),doctor:String(r.medico),meds:(r.medicamentos as Row[]).map(m=>String(m.medicamento))})).map((r, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-400">{r.date} · {r.doctor}</div>
                  <button className="text-xs text-blue-600 hover:underline" onClick={() => navigate('/patient/prescriptions')}>Ver receta</button>
                </div>
                <div className="space-y-1">
                  {r.meds.map((m, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
