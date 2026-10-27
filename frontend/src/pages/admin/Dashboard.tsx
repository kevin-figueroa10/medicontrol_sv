import {useClinic,day,date} from '../../context/Clinic';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  Calendar, Users, UserCheck, Clock, CheckCircle, XCircle,
  TrendingUp, ArrowRight, Stethoscope, Activity
} from 'lucide-react';






const statusColor: Record<string, string> = {
  'Confirmada': 'bg-blue-100 text-blue-700',
  'En espera': 'bg-amber-100 text-amber-700',
  'Solicitada': 'bg-slate-100 text-slate-600',
  'En consulta': 'bg-purple-100 text-purple-700',
  'Finalizada': 'bg-green-100 text-green-700',
  'Cancelada': 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {panel}=useClinic();
  const todays=panel.appointments.filter(a=>day(a.inicio)===day());
  const monthlyData=Array.from({length:6},(_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-5+i);return {mes:d.toLocaleDateString('es-SV',{month:'short'}),citas:panel.appointments.filter(a=>new Date(a.inicio).getMonth()===d.getMonth()&&new Date(a.inicio).getFullYear()===d.getFullYear()).length};});
  const pieData=['Finalizada','Confirmada','Cancelada','No asistió','En espera','En consulta'].map((name,i)=>({name,value:panel.appointments.filter(a=>a.estado===name).length,color:['#16a34a','#2563eb','#dc2626','#d97706','#f59e0b','#9333ea'][i]}));
  const specialtyData=[...new Set(panel.doctors.map(d=>String(d.especialidad)))].map(esp=>({esp,citas:panel.appointments.filter(a=>a.especialidad===esp).length}));
  const recentActivity=panel.logs.slice(0,6).map(l=>({id:l.id,action:`${l.accion} · ${l.entidad}`,detail:l.descripcion||`Registro #${l.entidadId}`,time:date(l.fechaUtc,true),icon:<Activity size={14}/>,color:'bg-blue-100 text-blue-600'}));
  const upcomingAppts=todays.map(a=>({time:new Date(a.inicio).toLocaleTimeString('es-SV',{hour:'2-digit',minute:'2-digit'}),patient:String(a.paciente),doctor:String(a.medico),specialty:String(a.especialidad),status:String(a.estado)}));
  const today = new Date().toLocaleDateString('es-SV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const stats = [
    {label:'Citas de hoy',value:todays.length,icon:<Calendar size={20}/>,light:'bg-blue-50',text:'text-blue-600',delta:'Programadas'},
    {label:'Pacientes atendidos',value:todays.filter(a=>a.estado==='Finalizada').length,icon:<CheckCircle size={20}/>,light:'bg-green-50',text:'text-green-600',delta:'Hoy'},
    {label:'Citas pendientes',value:todays.filter(a=>['Confirmada','En espera'].includes(a.estado)).length,icon:<Clock size={20}/>,light:'bg-amber-50',text:'text-amber-600',delta:'Faltan por atender'},
    {label:'Citas canceladas',value:todays.filter(a=>a.estado==='Cancelada').length,icon:<XCircle size={20}/>,light:'bg-red-50',text:'text-red-600',delta:'Hoy'},
    {label:'Médicos activos',value:panel.doctors.filter(a=>a.activo).length,icon:<Stethoscope size={20}/>,light:'bg-purple-50',text:'text-purple-600',delta:'Registrados'},
    {label:'Pacientes registrados',value:panel.patients.length,icon:<Users size={20}/>,light:'bg-indigo-50',text:'text-indigo-600',delta:'Total'},
  ];

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Dashboard</h1>
          <p className="text-sm text-slate-500 capitalize">{today}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/book')}>
          <Calendar size={14} />
          Nueva cita
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 leading-tight">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.light} ${s.text} flex items-center justify-center`}>
                {s.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</div>
            <div className={`text-xs mt-0.5 ${s.text}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly citas */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Citas por mes</h2>
            <span className="badge bg-green-100 text-green-700">Últimos seis meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 13 }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="citas" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 text-sm mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>Estado de citas</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-medium text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specialty + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Specialty bar */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-900 text-sm mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>Citas por especialidad</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={specialtyData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="esp" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={88} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="citas" fill="#818cf8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Actividad reciente</h2>
            <button className="text-xs text-blue-600 hover:underline" onClick={()=>navigate('/admin/audit')}>Ver todo</button>
          </div>
          <div className="space-y-3">
            {!recentActivity.length&&<p className="text-sm text-slate-500">Todavía no hay actividad registrada.</p>}{recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${a.color}`}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{a.action}</div>
                  <div className="text-xs text-slate-500 truncate">{a.detail}</div>
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Próximas citas – hoy</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/agenda')}>
            Ver agenda completa <ArrowRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Hora', 'Paciente', 'Médico', 'Especialidad', 'Estado', 'Acción'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!upcomingAppts.length&&<tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">No hay citas para hoy.</td></tr>}{upcomingAppts.map((a, i) => (
                <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{a.time}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {a.patient.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm text-slate-800">{a.patient}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{a.doctor}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{a.specialty}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${statusColor[a.status] || 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      className="btn btn-ghost btn-sm text-blue-600 hover:bg-blue-50"
                      onClick={() => navigate('/admin/waiting-room')}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
