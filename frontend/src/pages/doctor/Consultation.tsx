import {useEffect} from 'react';
import {useClinic,date,age,initials,Row} from '../../context/Clinic';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, FileText, FlaskConical, Activity, CheckCircle, X, Heart, Thermometer, Weight, Ruler, Droplets } from 'lucide-react';

export default function Consultation() {
  const navigate = useNavigate();const {panel,mutate,busy}=useClinic();
  const [citaId,setCitaId]=useState(Number(new URLSearchParams(window.location.search).get('cita')));
  const cita=panel.appointments.find(a=>a.id===citaId);
  const patient=panel.patients.find(p=>p.id===cita?.pacienteId);
  const existing=panel.consultations.find(c=>c.citaId===citaId);
  const [error,setError]=useState('');

  const [saved, setSaved] = useState(false);
  const blank={reason:'',pa:'',temp:'',peso:'',altura:'',fc:'',spo2:'',symptoms:'',antecedents:'',evaluation:'',diagnosis:'',treatment:'',recommendations:''};
  const [form,setForm]=useState(blank);
  useEffect(()=>{const c=existing;const v=c?.signos;setForm(c?{reason:c.motivo,pa:v?.presionSistolica&&v?.presionDiastolica?`${v.presionSistolica}/${v.presionDiastolica}`:'',temp:String(v?.temperatura??''),peso:String(v?.pesoKg??''),altura:String(v?.alturaCm??''),fc:String(v?.frecuenciaCardiaca??''),spo2:String(v?.saturacion??''),symptoms:c.observaciones,antecedents:c.antecedentes,evaluation:c.evaluacion,diagnosis:c.diagnostico,treatment:c.tratamiento,recommendations:c.recomendaciones}:{...blank,reason:cita?.motivo||''});setSaved(false);setError('');},[citaId,existing?.id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {setError('');if(existing){setSaved(true);return;}if(!cita||cita.estado!=='En consulta'){setError('Inicie la atención desde la sala de espera.');return;}if(!form.reason.trim()||!form.diagnosis.trim()){setError('Complete el motivo y diagnóstico.');return;}
   if(form.pa&&!/^\d{2,3}\/\d{2,3}$/.test(form.pa)){setError('Presión arterial: use el formato 120/80.');return;}
   for(const value of [form.temp,form.peso,form.altura,form.fc,form.spo2])if(value!==''&&!Number.isFinite(Number(value))){setError('Los signos vitales deben ser valores numéricos.');return;}
   const num=(v:string)=>v===''?null:Number(v);const [sis,dia]=form.pa.split('/');
   try{await mutate('/consultas',{citaId,motivo:form.reason,diagnostico:form.diagnosis,antecedentes:form.antecedents,evaluacion:form.evaluation,tratamiento:form.treatment,recomendaciones:form.recommendations,observaciones:form.symptoms,signos:{consultaId:0,temperatura:num(form.temp),pesoKg:num(form.peso),alturaCm:num(form.altura),frecuenciaCardiaca:num(form.fc),saturacion:num(form.spo2),presionSistolica:num(sis||''),presionDiastolica:num(dia||'')}});setSaved(true);}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo guardar.');}
  };
  async function finish(){try{await mutate(`/citas/${citaId}/estado?estado=Finalizada`,undefined,'PATCH');navigate('/admin/waiting-room');}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo finalizar.');}}
  if(!cita)return <div className="p-6 max-w-3xl"><h1 className="text-xl font-bold mb-6">Consulta médica</h1><div className="card p-6"><label className="block text-sm mb-3">Seleccione una cita en consulta</label><select className="input-field" value="" onChange={e=>setCitaId(Number(e.target.value))}><option value="">Seleccionar…</option>{panel.appointments.filter(a=>a.estado==='En consulta').map(a=><option key={a.id} value={a.id}>#{a.id} · {a.paciente}</option>)}</select><p className="mt-4 text-sm text-slate-500">Inicie la consulta desde la sala de espera. Las citas se filtran según su cuenta.</p></div></div>;


  if (saved) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12">
        <div className="card p-10 text-center">{error&&<p role="alert" className="text-red-700 mb-4">{error}</p>}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Consulta guardada</h2>
          <p className="text-slate-500 text-sm mb-6">La consulta fue registrada correctamente en el expediente.</p>
          <div className="flex flex-col gap-2">
            <button className="btn btn-primary justify-center" onClick={() => navigate(`/doctor/prescription?consulta=${panel.consultations.find(c=>c.citaId===citaId)?.id||''}`)}>
              <FileText size={14} />
              Generar receta
            </button>
            <button className="btn btn-secondary justify-center" onClick={() => navigate('/admin/studies')}>
              <FlaskConical size={14} />
              Solicitar estudio
            </button>
            <button className="btn btn-ghost justify-center" onClick={finish}>
              Finalizar consulta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl">{error&&<p role="alert" className="mb-4 p-4 rounded-xl text-red-700 bg-red-50">{error}</p>}
      {/* Header */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center text-base font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{initials(String(cita.paciente))}</div>
            <div>
              <h1 className="text-base font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{cita.paciente}</h1>
              <div className="text-xs text-slate-500">{patient?age(patient.fechaNacimiento):'—'} años · PAC-{cita.pacienteId} · {cita.especialidad}</div>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-slate-500">
            <div><span className="font-medium text-slate-700">Médico:</span> {cita.medico}</div>
            <div><span className="font-medium text-slate-700">Fecha:</span> {date(cita.inicio)}</div>
            <div><span className="font-medium text-slate-700">Consulta #:</span> {existing?.id||'Nueva'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main form */}
        <div className="xl:col-span-2 space-y-5">
          {/* A. Motivo */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">A</span>
              Motivo de consulta
            </h2>
            <textarea
              readOnly={Boolean(existing)} maxLength={2000} className="input-field resize-none"
              rows={3}
              value={form.reason}
              onChange={set('reason')}
            />
          </div>

          {/* B. Signos vitales */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">B</span>
              Signos vitales
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: 'pa', label: 'Presión arterial', unit: 'mmHg', icon: <Heart size={14} className="text-red-500" />, placeholder: '120/80' },
                { key: 'temp', label: 'Temperatura', unit: '°C', icon: <Thermometer size={14} className="text-orange-500" />, placeholder: '36.6' },
                { key: 'peso', label: 'Peso', unit: 'kg', icon: <Weight size={14} className="text-blue-500" />, placeholder: '70' },
                { key: 'altura', label: 'Altura', unit: 'cm', icon: <Ruler size={14} className="text-indigo-500" />, placeholder: '170' },
                { key: 'fc', label: 'Frec. cardíaca', unit: 'bpm', icon: <Activity size={14} className="text-green-500" />, placeholder: '72' },
                { key: 'spo2', label: 'SpO₂', unit: '%', icon: <Droplets size={14} className="text-cyan-500" />, placeholder: '98' },
              ].map(v => (
                <div key={v.key}>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                    {v.icon} {v.label}
                  </label>
                  <div className="relative">
                    <input
                      readOnly={Boolean(existing)} maxLength={30} type={v.key==='pa'?'text':'number'} step="any"
                      className="input-field pr-10"
                      placeholder={v.placeholder}
                      value={(form as any)[v.key]}
                      onChange={set(v.key)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{v.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Clinical info */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">C</span>
              Información clínica
            </h2>
            <div className="space-y-4">
              {[
                { key: 'symptoms', label: 'Síntomas / Observaciones', rows: 2 },
                { key: 'antecedents', label: 'Antecedentes relevantes', rows: 2 },
                { key: 'evaluation', label: 'Evaluación médica', rows: 3 },
                { key: 'diagnosis', label: 'Diagnóstico', rows: 2 },
                { key: 'treatment', label: 'Tratamiento', rows: 2 },
                { key: 'recommendations', label: 'Recomendaciones', rows: 2 },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
                  <textarea
                    readOnly={Boolean(existing)} maxLength={2000} className="input-field resize-none"
                    rows={f.rows}
                    value={(form as any)[f.key]}
                    onChange={set(f.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar – quick actions + history */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Acciones</h2>
            <div className="space-y-2">
              <button className="btn btn-primary w-full justify-center" disabled={busy||Boolean(existing)} onClick={handleSave}>
                <Save size={14} />
                Guardar consulta
              </button>
              <button disabled={!existing} className="btn btn-secondary w-full justify-center" onClick={() => navigate(`/doctor/prescription?consulta=${panel.consultations.find(c=>c.citaId===citaId)?.id||''}`)}>
                <FileText size={14} />
                Generar receta
              </button>
              <button disabled={!existing} className="btn btn-secondary w-full justify-center" onClick={() => navigate('/admin/studies')}>
                <FlaskConical size={14} />
                Solicitar estudio
              </button>
              <button disabled={!existing} className="btn btn-secondary w-full justify-center" onClick={()=>navigate('/admin/followups')}>
                <Activity size={14} />
                Programar seguimiento
              </button>
              <button disabled={!existing||cita.estado==='Finalizada'} className="btn btn-danger w-full justify-center" onClick={finish}>
                <X size={14} />
                Finalizar consulta
              </button>
            </div>
          </div>

          {/* Previous consultations */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Historial del paciente</h2>
            <div className="space-y-3">
              {panel.consultations.filter(c=>c.pacienteId===cita.pacienteId&&c.citaId!==citaId).map(c=>({date:date(c.fechaUtc),title:String(c.motivo),dx:String(c.diagnostico)})).map((c,i)=> (
                <div key={i} className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-400">{c.date}</div>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">{c.title}</div>
                  <div className="text-xs text-slate-500">{c.dx}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies/alerts */}
          <div className="card p-5 border-amber-200 bg-amber-50">
            <h2 className="font-semibold text-amber-800 text-sm mb-2">Alertas clínicas</h2>
            <p className="text-xs text-amber-700 whitespace-pre-wrap">{patient?.notas||'No hay alertas registradas en el expediente.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
