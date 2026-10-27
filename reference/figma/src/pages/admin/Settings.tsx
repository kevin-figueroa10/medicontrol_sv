import { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [clinic, setClinic] = useState({
    name: 'MediControl SV – Consultorio Integral', address: 'Calle Médica #25, Col. Escalón, San Salvador',
    phone: '2234-5678', email: 'info@medicontrol.sv',
    schedule: 'Lunes a Viernes 08:00 – 18:00 / Sábados 08:00 – 12:00',
    consultDuration: '30',
  });
  const [apptConfig, setApptConfig] = useState({
    advanceDays: '60', cancelHours: '24', remindHours: '24', allowOnline: true,
  });
  const [notifConfig, setNotifConfig] = useState({
    apptReminder: true, apptConfirm: true, apptCancel: true, studyResult: true, followup: true,
  });

  const setC = (k: keyof typeof clinic) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setClinic(f => ({ ...f, [k]: e.target.value }));
  const setA = (k: keyof typeof apptConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setApptConfig(f => ({ ...f, [k]: e.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setN = (k: keyof typeof notifConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNotifConfig(f => ({ ...f, [k]: e.target.checked }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Configuración</h1>
          <p className="text-sm text-slate-500">Ajustes generales del consultorio</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} /> Cambios guardados
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Clinic info */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 text-sm mb-5 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            Información del consultorio
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del consultorio</label>
              <input className="input-field" value={clinic.name} onChange={setC('name')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
              <input className="input-field" value={clinic.address} onChange={setC('address')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input className="input-field" value={clinic.phone} onChange={setC('phone')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                <input className="input-field" value={clinic.email} onChange={setC('email')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horario general de atención</label>
              <input className="input-field" value={clinic.schedule} onChange={setC('schedule')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duración predeterminada de consulta (minutos)</label>
              <input type="number" className="input-field" value={clinic.consultDuration} onChange={setC('consultDuration')} style={{ maxWidth: 120 }} />
            </div>
          </div>
        </div>

        {/* Appointment config */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 text-sm mb-5 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
            Configuración de citas
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Días máximos de anticipo</label>
                <input type="number" className="input-field" value={apptConfig.advanceDays} onChange={setA('advanceDays')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horas mínimas para cancelar</label>
                <input type="number" className="input-field" value={apptConfig.cancelHours} onChange={setA('cancelHours')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horas de anticipación para recordatorio</label>
              <input type="number" className="input-field" value={apptConfig.remindHours} onChange={setA('remindHours')} style={{ maxWidth: 140 }} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="online" checked={apptConfig.allowOnline} onChange={setA('allowOnline')} className="w-4 h-4 rounded" />
              <label htmlFor="online" className="text-sm text-slate-700 cursor-pointer">Permitir agendamiento de citas en línea por el paciente</label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 text-sm mb-5 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">3</span>
            Configuración de notificaciones
          </h2>
          <div className="space-y-3">
            {[
              { key: 'apptReminder', label: 'Recordatorio de cita (24h antes)' },
              { key: 'apptConfirm', label: 'Confirmación de cita agendada' },
              { key: 'apptCancel', label: 'Notificación de cita cancelada' },
              { key: 'studyResult', label: 'Resultado de estudio disponible' },
              { key: 'followup', label: 'Recordatorio de seguimiento próximo' },
            ].map(n => (
              <label key={n.key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={(notifConfig as any)[n.key]} onChange={setN(n.key as keyof typeof notifConfig)} className="w-4 h-4 rounded" />
                <span className="text-sm text-slate-700">{n.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={14} /> Guardar cambios
        </button>
      </div>
    </div>
  );
}
