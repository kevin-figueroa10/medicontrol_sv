import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';

type View = 'day' | 'week' | 'month';

const statusColor: Record<string, { bg: string; text: string; border: string }> = {
  'Solicitada':  { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-l-slate-400' },
  'Confirmada':  { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-l-blue-500' },
  'En espera':   { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-l-amber-500' },
  'En consulta': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-l-purple-500' },
  'Finalizada':  { bg: 'bg-green-50', text: 'text-green-800', border: 'border-l-green-500' },
  'Cancelada':   { bg: 'bg-red-50', text: 'text-red-800', border: 'border-l-red-500' },
  'No asistió':  { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-l-orange-500' },
};

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const hours = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

const appts: Record<string, { patient: string; doctor: string; status: string; motivo: string }[]> = {
  '2026-09-13 09:00': [{ patient: 'Carlos Mendoza', doctor: 'Dr. Vega', status: 'Confirmada', motivo: 'Control de hipertensión' }],
  '2026-09-13 09:30': [{ patient: 'María García', doctor: 'Dra. López', status: 'En espera', motivo: 'Dolor de cabeza persistente' }],
  '2026-09-13 10:00': [{ patient: 'Ana Martínez', doctor: 'Dr. Torres', status: 'En consulta', motivo: 'Control pediátrico' }],
  '2026-09-13 10:30': [{ patient: 'Roberto Flores', doctor: 'Dra. López', status: 'Confirmada', motivo: 'Revisión general' }],
  '2026-09-13 11:00': [{ patient: 'Sofía Torres', doctor: 'Dr. Vega', status: 'Solicitada', motivo: 'Dolor en el pecho' }],
  '2026-09-13 14:00': [{ patient: 'Luis Hernández', doctor: 'Dr. Vega', status: 'Confirmada', motivo: 'Seguimiento cardíaco' }],
  '2026-09-14 09:00': [{ patient: 'Diego Cruz', doctor: 'Dr. Vega', status: 'Confirmada', motivo: 'Primera consulta' }],
  '2026-09-15 10:00': [{ patient: 'Valentina López', doctor: 'Dra. López', status: 'Confirmada', motivo: 'Vacunación' }],
  '2026-09-16 09:00': [{ patient: 'Marco Vásquez', doctor: 'Dr. Vega', status: 'Confirmada', motivo: 'Ecocardiograma' }],
  '2026-09-17 11:00': [{ patient: 'Isabella Ramírez', doctor: 'Dra. López', status: 'Solicitada', motivo: 'Consulta general' }],
  '2026-09-11 09:00': [{ patient: 'Pedro Sánchez', doctor: 'Dr. Vega', status: 'Finalizada', motivo: 'Hipertensión' }],
  '2026-09-12 10:00': [{ patient: 'Carmen Ruiz', doctor: 'Dra. López', status: 'Finalizada', motivo: 'Control anual' }],
};

function getWeekDates(base: Date) {
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(base.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmt(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function Agenda() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('week');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 13)); // Sep 13

  const weekDates = getWeekDates(currentDate);
  const todayStr = fmt(new Date(2026, 8, 13));

  const navigate2 = (dir: number) => {
    const d = new Date(currentDate);
    if (view === 'day') d.setDate(d.getDate() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const monthLabel = currentDate.toLocaleDateString('es-SV', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 capitalize" style={{ fontFamily: 'DM Sans, sans-serif' }}>Agenda médica</h1>
          <p className="text-sm text-slate-500 capitalize">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status legend */}
          <div className="flex gap-2 mr-2 flex-wrap">
            {Object.entries(statusColor).slice(0, 4).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className={`w-2.5 h-2.5 rounded-full ${c.bg.replace('bg-', 'bg-').replace('-50', '-400').replace('-100', '-400')}`} style={{ background: s === 'Confirmada' ? '#3b82f6' : s === 'En espera' ? '#f59e0b' : s === 'En consulta' ? '#a855f7' : '#10b981' }} />
                {s}
              </div>
            ))}
          </div>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(['day', 'week', 'month'] as View[]).map(v => (
              <button
                key={v}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === v ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                onClick={() => setView(v)}
              >
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button className="btn btn-secondary btn-sm p-1.5" onClick={() => navigate2(-1)}><ChevronLeft size={15} /></button>
            <button className="btn btn-secondary btn-sm px-3 py-1.5 text-xs" onClick={() => setCurrentDate(new Date(2026, 8, 13))}>Hoy</button>
            <button className="btn btn-secondary btn-sm p-1.5" onClick={() => navigate2(1)}><ChevronRight size={15} /></button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/book')}>
            <Plus size={13} />
            Nueva cita
          </button>
        </div>
      </div>

      {/* Week view */}
      {view === 'week' && (
        <div className="card overflow-hidden">
          {/* Day headers */}
          <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
            <div className="border-r border-slate-100" />
            {weekDates.map((d, i) => {
              const isToday = fmt(d) === todayStr;
              return (
                <div key={i} className={`text-center py-3 border-r border-slate-100 last:border-0 ${isToday ? 'bg-blue-50' : ''}`}>
                  <div className="text-xs text-slate-500">{weekDays[i]}</div>
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mt-1 text-sm font-semibold ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hour grid */}
          <div className="overflow-y-auto max-h-[520px]">
            {hours.map(hour => (
              <div key={hour} className="grid border-b border-slate-50 hover:bg-slate-50/50" style={{ gridTemplateColumns: '64px repeat(7, 1fr)', minHeight: 52 }}>
                <div className="text-xs text-slate-400 px-2 py-2 border-r border-slate-100 pt-1.5">{hour}</div>
                {weekDates.map((d, di) => {
                  const key = `${fmt(d)} ${hour}`;
                  const dayAppts = appts[key] || [];
                  const isToday = fmt(d) === todayStr;
                  return (
                    <div key={di} className={`border-r border-slate-100 last:border-0 p-1 ${isToday ? 'bg-blue-50/30' : ''}`}>
                      {dayAppts.map((a, ai) => {
                        const c = statusColor[a.status] || statusColor['Solicitada'];
                        return (
                          <button
                            key={ai}
                            className={`w-full text-left rounded-lg p-1.5 border-l-4 ${c.bg} ${c.text} ${c.border} hover:brightness-95 transition-all`}
                            onClick={() => navigate('/admin/waiting-room')}
                          >
                            <div className="text-xs font-semibold leading-tight truncate">{a.patient}</div>
                            <div className="text-xs opacity-75 truncate leading-tight">{a.doctor}</div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day view */}
      {view === 'day' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-blue-50">
            <div className="text-sm font-semibold text-blue-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {currentDate.toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          <div className="overflow-y-auto max-h-[520px]">
            {hours.map(hour => {
              const key = `${fmt(currentDate)} ${hour}`;
              const dayAppts = appts[key] || [];
              return (
                <div key={hour} className="flex gap-4 border-b border-slate-50 px-5 py-2 min-h-[56px] hover:bg-slate-50/50">
                  <div className="text-xs text-slate-400 w-12 pt-1 flex-shrink-0">{hour}</div>
                  <div className="flex-1 space-y-1.5">
                    {dayAppts.map((a, ai) => {
                      const c = statusColor[a.status] || statusColor['Solicitada'];
                      return (
                        <div key={ai} className={`rounded-xl p-3 border-l-4 ${c.bg} ${c.text} ${c.border}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold">{a.patient}</div>
                              <div className="text-xs opacity-70">{a.doctor} · {a.motivo}</div>
                            </div>
                            <span className={`badge ${c.bg.replace('50', '100')} ${c.text}`}>{a.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month view */}
      {view === 'month' && (
        <div className="card overflow-hidden">
          <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {weekDays.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-500 py-3 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {Array.from({ length: 35 }, (_, i) => {
              const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
              const dayNum = i - firstDay + 1;
              const isValid = dayNum >= 1 && dayNum <= 31;
              const d = isValid ? new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum) : null;
              const dateStr = d ? fmt(d) : '';
              const hasAppts = dateStr && Object.keys(appts).some(k => k.startsWith(dateStr));
              const isToday = dateStr === todayStr;
              return (
                <div key={i} className={`border-b border-r border-slate-100 min-h-[80px] p-2 ${!isValid ? 'bg-slate-50' : ''} ${isToday ? 'bg-blue-50' : ''}`}>
                  {isValid && (
                    <>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mb-1 ${isToday ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'}`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        {dayNum}
                      </div>
                      {hasAppts && (
                        <div className="space-y-0.5">
                          {Object.entries(appts)
                            .filter(([k]) => k.startsWith(dateStr))
                            .flatMap(([, v]) => v)
                            .slice(0, 2)
                            .map((a, ai) => {
                              const c = statusColor[a.status] || statusColor['Solicitada'];
                              return (
                                <div key={ai} className={`text-xs px-1.5 py-0.5 rounded ${c.bg} ${c.text} truncate`}>
                                  {a.patient.split(' ')[0]}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
