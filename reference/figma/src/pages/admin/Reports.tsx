import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Download, TrendingUp, Users, Calendar, XCircle } from 'lucide-react';

const monthData = [
  { mes: 'Abr', citas: 142, atendidas: 128, canceladas: 14 },
  { mes: 'May', citas: 168, atendidas: 151, canceladas: 17 },
  { mes: 'Jun', citas: 155, atendidas: 139, canceladas: 16 },
  { mes: 'Jul', citas: 189, atendidas: 172, canceladas: 17 },
  { mes: 'Ago', citas: 201, atendidas: 183, canceladas: 18 },
  { mes: 'Sep', citas: 176, atendidas: 160, canceladas: 16 },
];

const revenueData = [
  { mes: 'Abr', ingresos: 5420 },
  { mes: 'May', ingresos: 6320 },
  { mes: 'Jun', ingresos: 5840 },
  { mes: 'Jul', ingresos: 7150 },
  { mes: 'Ago', ingresos: 7640 },
  { mes: 'Sep', ingresos: 6080 },
];

const patientsPie = [
  { name: 'Nuevos', value: 87, color: '#2563eb' },
  { name: 'Recurrentes', value: 313, color: '#10b981' },
];

export default function Reports() {
  const totals = monthData.reduce((acc, m) => ({
    citas: acc.citas + m.citas,
    atendidas: acc.atendidas + m.atendidas,
    canceladas: acc.canceladas + m.canceladas,
  }), { citas: 0, atendidas: 0, canceladas: 0 });
  const totalIngresos = revenueData.reduce((s, r) => s + r.ingresos, 0);

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Reportes</h1>
          <p className="text-sm text-slate-500">Resumen del período: Abril – Septiembre 2026</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <input type="date" className="input-field" defaultValue="2026-04-01" style={{ width: 'auto' }} />
            <input type="date" className="input-field" defaultValue="2026-09-30" style={{ width: 'auto' }} />
          </div>
          <button className="btn btn-primary btn-sm">
            <Download size={13} />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total citas', value: totals.citas, icon: <Calendar size={18} />, color: 'text-blue-600 bg-blue-50', delta: '6 meses' },
          { label: 'Atendidas', value: totals.atendidas, icon: <TrendingUp size={18} />, color: 'text-green-600 bg-green-50', delta: `${Math.round(totals.atendidas / totals.citas * 100)}% del total` },
          { label: 'Canceladas', value: totals.canceladas, icon: <XCircle size={18} />, color: 'text-red-600 bg-red-50', delta: `${Math.round(totals.canceladas / totals.citas * 100)}% del total` },
          { label: 'Ingresos registrados', value: `$${totalIngresos.toLocaleString()}`, icon: <TrendingUp size={18} />, color: 'text-emerald-600 bg-emerald-50', delta: '6 meses' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>{s.icon}</div>
            </div>
            <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 text-sm mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>Citas por mes</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="atendidas" fill="#2563eb" radius={[4, 4, 0, 0]} name="Atendidas" />
              <Bar dataKey="canceladas" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Canceladas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 text-sm mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>Ingresos registrados ($)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Ingresos']} />
              <Line type="monotone" dataKey="ingresos" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 text-sm mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Nuevos vs recurrentes</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={patientsPie} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                {patientsPie.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-2">
            {patientsPie.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name}: <strong>{d.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Summary table */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-900 text-sm mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Resumen mensual</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Mes', 'Total citas', 'Atendidas', 'Canceladas', 'Ingresos'].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthData.map((m, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 font-medium text-slate-700">{m.mes}</td>
                  <td className="py-2.5 text-slate-600">{m.citas}</td>
                  <td className="py-2.5 text-green-600">{m.atendidas}</td>
                  <td className="py-2.5 text-red-500">{m.canceladas}</td>
                  <td className="py-2.5 text-slate-700 font-medium">${revenueData[i].ingresos.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
