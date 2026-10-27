import {useClinic,date,age,initials,Row} from '../../context/Clinic';
import {api,downloadDocument} from '../../lib/api';
import {Modal} from '../../components/ClinicalUI';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, Calendar, FileText, FlaskConical,
  Activity, Clock, Plus, TrendingUp, Heart, Thermometer,
  Weight, Ruler, Wind, Droplets, ChevronRight
} from 'lucide-react';

const tabs = ['Resumen', 'Historial de consultas', 'Signos vitales', 'Recetas', 'Estudios médicos', 'Seguimientos', 'Citas', 'Documentos'];






const timelineColor: Record<string, string> = {
  consult: 'bg-blue-500',
  study: 'bg-amber-500',
  prescription: 'bg-green-500',
};

export default function PatientRecord() {
  const navigate = useNavigate();const {panel,session,reload}=useClinic();const id=Number(new URLSearchParams(window.location.search).get('id'));const patient=panel.patients.find(p=>p.id===id);const [detail,setDetail]=useState<Row|null>(null),[fileError,setFileError]=useState('');
  const cs=panel.consultations.filter(c=>c.pacienteId===id),ps=panel.prescriptions.filter(p=>p.pacienteId===id),ss=panel.studies.filter(s=>s.pacienteId===id),as=panel.appointments.filter(a=>a.pacienteId===id);
  const consultations=cs.map(c=>({id:c.id,date:date(c.fechaUtc),doctor:String(c.medico),specialty:String(as.find(a=>a.id===c.citaId)?.especialidad||''),diagnosis:String(c.diagnostico),status:String(c.estado)}));
  const vitals=cs.filter(c=>c.signos).map(c=>({date:date(c.fechaUtc),pa:c.signos.presionSistolica?`${c.signos.presionSistolica}/${c.signos.presionDiastolica}`:'—',temp:c.signos.temperatura??'—',peso:c.signos.pesoKg??'—',altura:c.signos.alturaCm??'—',fc:c.signos.frecuenciaCardiaca??'—',spo2:c.signos.saturacion??'—'}));
  const latest=cs.find(c=>c.signos)?.signos;
  const prescriptions=ps.map(p=>({id:p.id,date:date(p.fechaUtc),doctor:String(p.medico),meds:(p.medicamentos as Row[]).map(m=>`${m.medicamento} · ${m.dosis} · ${m.frecuencia} · ${m.duracion}`)}));
  const studies=ss.map(s=>({id:s.id,date:date(s.fechaUtc),study:String(s.tipo),doctor:String(s.medico),status:String(s.estado)}));
  const followups=panel.followups.filter(f=>f.pacienteId===id).map(f=>({date:date(f.ultimaConsulta),doctor:String(f.medico),reason:String(f.motivo),recommended:date(f.fecha),status:String(f.estado)}));
  const appointments=as.map(a=>({date:date(a.inicio),time:new Date(a.inicio).toLocaleTimeString('es-SV',{hour:'2-digit',minute:'2-digit'}),doctor:String(a.medico),specialty:String(a.especialidad),reason:String(a.motivo),status:String(a.estado)}));
  const docs=panel.documents.filter(d=>d.pacienteId===id).map(d=>({id:d.id,name:String(d.nombre),type:String(d.tipoMime).split('/')[1].toUpperCase(),date:date(d.fechaUtc),doctor:String(d.usuario||'—')}));
  const timeline=cs.map(c=>({date:date(c.fechaUtc),event:'Consulta',detail:String(c.diagnostico),type:'consult'}));
  const upcoming=as.find(a=>new Date(a.inicio)>new Date()&&!['Cancelada','No asistió'].includes(a.estado));
  async function getDoc(id:number,name:string){try{await downloadDocument(id,name);}catch(ex){setFileError(ex instanceof Error?ex.message:'No se pudo descargar.');}}
  async function upload(file:File){setFileError('');if(file.size>5242880){setFileError('Máximo 5 MB.');return;}const form=new FormData();form.append('archivo',file);try{await api(`/pacientes/${id}/documentos`,{method:'POST',body:form});await reload();}catch(ex){setFileError(ex instanceof Error?ex.message:'No se pudo cargar.');}}

  const [activeTab, setActiveTab] = useState(0);

  if(!patient)return <div className="p-6"><p className="card p-8 text-slate-500">Seleccione un expediente desde la lista de pacientes.</p></div>;
  return (
    <div className="p-6 max-w-screen-xl">{fileError&&<p className="p-3 mb-4 text-red-700 bg-red-50" role="alert">{fileError}</p>}
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
        <button className="hover:text-blue-600" onClick={() => navigate('/admin/patients')}>Pacientes</button>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">{patient.nombre}</span>
      </div>

      {/* Patient header */}
      <div className="card p-5 mb-4">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {initials(String(patient.nombre))}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <div>
                <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{patient.nombre}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-0.5 flex-wrap">
                  <span>{age(patient.fechaNacimiento)} años · {patient.sexo||'—'}</span>
                  <span className="flex items-center gap-1"><Phone size={12} /> {patient.telefono||'—'}</span>
                  <span className="flex items-center gap-1"><Mail size={12} /> {patient.correo||'—'}</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">PAC-{patient.id}</span>
                </div>
              </div>
              <span className="badge bg-green-100 text-green-700 ml-auto">Activo</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span>Médico tratante: <strong className="text-slate-700">{cs[0]?.medico||'—'}</strong></span>
              <span>Especialidad: <strong className="text-slate-700">{as[0]?.especialidad||'—'}</strong></span>
              <span>Última consulta: <strong className="text-slate-700">{date(cs[0]?.fechaUtc)}</strong></span>
              <span>Próxima cita: <strong className="text-blue-600">{date(upcoming?.inicio,true)}</strong></span>
            </div>
          </div>
          <button
            disabled={session.rol!=='Medico'} className="btn btn-primary btn-sm flex-shrink-0"
            onClick={() => navigate(`/doctor/consultation?cita=${as.find(a=>a.estado==='En consulta')?.id||''}`)}
          >
            <Plus size={13} />
            Nueva consulta
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`tab-btn whitespace-nowrap ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {([cs,cs,vitals,ps,ss,followups,as,docs][activeTab]||[]).length===0&&<p className="card p-8 text-center text-sm text-slate-500 mb-4">No hay registros en esta sección.</p>}
      {/* Tab content */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Summary cards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Last vitals */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 text-sm mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Últimos signos vitales</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { icon: <Heart size={16} className="text-red-500" />, label: 'P. Arterial', value: latest?.presionSistolica?`${latest.presionSistolica}/${latest.presionDiastolica}`:'—', unit: 'mmHg' },
                  { icon: <Thermometer size={16} className="text-orange-500" />, label: 'Temperatura', value:latest?.temperatura??'—', unit: '°C' },
                  { icon: <Weight size={16} className="text-blue-500" />, label: 'Peso', value:latest?.pesoKg??'—', unit: 'kg' },
                  { icon: <Ruler size={16} className="text-indigo-500" />, label: 'Altura', value:latest?.alturaCm??'—', unit: 'cm' },
                  { icon: <Activity size={16} className="text-green-500" />, label: 'Frec. cardíaca', value:latest?.frecuenciaCardiaca??'—', unit: 'bpm' },
                  { icon: <Droplets size={16} className="text-cyan-500" />, label: 'SpO₂', value:latest?.saturacion??'—', unit: '%' },
                ].map(v => (
                  <div key={v.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="flex justify-center mb-1">{v.icon}</div>
                    <div className="text-lg font-bold text-slate-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>{v.value}</div>
                    <div className="text-xs text-slate-400">{v.unit}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{v.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent consultations */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Consultas recientes</h2>
                <button className="text-xs text-blue-600 hover:underline" onClick={() => setActiveTab(1)}>Ver historial completo</button>
              </div>
              <div className="space-y-3">
                {consultations.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileText size={15} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{c.diagnosis}</div>
                      <div className="text-xs text-slate-500">{c.doctor} · {c.specialty}</div>
                    </div>
                    <div className="text-xs text-slate-400">{c.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Línea de tiempo clínica</h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-5">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`w-6 h-6 rounded-full ${timelineColor[t.type]} flex-shrink-0 z-10 flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">{t.date}</div>
                      <div className="text-sm font-medium text-slate-800 mt-0.5">{t.event}</div>
                      <div className="text-xs text-slate-500">{t.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Fecha', 'Médico', 'Especialidad', 'Diagnóstico', 'Estado', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {consultations.map((c, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{c.date}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-800 font-medium">{c.doctor}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{c.specialty}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{c.diagnosis}</td>
                    <td className="px-5 py-3.5"><span className="badge bg-green-100 text-green-700">{c.status}</span></td>
                    <td className="px-5 py-3.5"><button className="btn btn-ghost btn-sm text-blue-600" onClick={()=>setDetail(cs.find(x=>x.id===c.id)||null)}>Ver</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Fecha', 'P. Arterial', 'Temperatura', 'Peso', 'Altura', 'Frec. Cardíaca', 'SpO₂'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vitals.map((v, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{v.date}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-red-600">{v.pa}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{v.temp}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{v.peso}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{v.altura}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{v.fc}</td>
                    <td className="px-5 py-3.5 text-sm text-green-600 font-medium">{v.spo2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="space-y-4">
          {prescriptions.map((p, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{p.date}</div>
                  <div className="text-xs text-slate-500">{p.doctor}</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={()=>setDetail(ps.find(x=>x.id===p.id)||null)}>
                  <FileText size={13} />
                  Ver receta
                </button>
              </div>
              <div className="space-y-1.5">
                {p.meds.map((m, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 4 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Fecha', 'Estudio', 'Médico solicitante', 'Estado', 'Acción'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studies.map((s, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{s.date}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{s.study}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{s.doctor}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${s.status === 'Resultado disponible' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><button className="btn btn-ghost btn-sm text-blue-600" onClick={()=>setDetail(ss.find(x=>x.id===s.id)||null)}>Ver resultado</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5 – Seguimientos */}
      {activeTab === 5 && (
        <div className="space-y-3">
          {followups.map((f, i) => (
            <div key={i} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{f.reason}</div>
                <div className="text-xs text-slate-500 mt-0.5">{f.doctor} · Última consulta: {f.date}</div>
                <div className="text-xs text-slate-500">Fecha recomendada: <strong>{f.recommended}</strong></div>
              </div>
              <span className={`badge self-start sm:self-auto ${f.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{f.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6 – Citas */}
      {activeTab === 6 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Fecha','Hora','Médico','Especialidad','Motivo','Estado'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{a.date}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{a.time}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{a.doctor}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{a.specialty}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{a.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${a.status === 'Confirmada' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab===7&&session.rol!=='Recepcionista'&&<label className="btn btn-secondary mb-4 cursor-pointer">Adjuntar PDF o imagen (máx. 5 MB)<input className="hidden" type="file" accept="application/pdf,image/png,image/jpeg" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f);e.target.value='';}}/></label>}
      {/* Tab 7 – Documentos */}
      {activeTab === 7 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Nombre','Tipo','Fecha','Médico','Acciones'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((d, i) => (
                  <tr key={i} className="table-row border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{d.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${d.type === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{d.type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{d.date}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{d.doctor}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-sm text-blue-600 text-xs" onClick={()=>getDoc(d.id,d.name)}>Ver</button>
                        <button className="btn btn-ghost btn-sm text-slate-500 text-xs" onClick={()=>getDoc(d.id,d.name)}>Descargar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {detail&&<Modal title={detail.tipo||'Detalle del expediente'} onClose={()=>setDetail(null)}><p className="text-sm text-slate-500 mb-4">{detail.medico} · {date(detail.fechaUtc,true)}</p>{['motivo','antecedentes','evaluacion','diagnostico','tratamiento','recomendaciones','observaciones','indicaciones'].filter(k=>detail[k]).map(k=><div key={k} className="mb-4"><h3 className="text-xs uppercase text-slate-500 mb-1">{k}</h3><p className="text-sm whitespace-pre-wrap">{detail[k]}</p></div>)}{detail.medicamentos?.map((m:Row,i:number)=><p key={i} className="text-sm mb-3">{m.medicamento} · {m.dosis} · {m.frecuencia} · {m.duracion}</p>)}{detail.resultado&&<p className="text-sm whitespace-pre-wrap">{detail.resultado.descripcion}</p>}</Modal>}
    </div>
  );
}
