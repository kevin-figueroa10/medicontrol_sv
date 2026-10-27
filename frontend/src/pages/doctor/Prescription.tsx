import {useClinic,date,age,Row} from '../../context/Clinic';
import { useState } from 'react';
import { Plus, Trash2, Printer, Eye, Save } from 'lucide-react';

interface Drug {
  id: number;
  name: string;
  presentation: string;
  instructions: string;
  frequency: string;
  duration: string;
  notes: string;
}

export default function Prescription() {
 const {panel,mutate,busy}=useClinic();const [consultaId,setConsultaId]=useState(Number(new URLSearchParams(window.location.search).get('consulta')));const consult=panel.consultations.find(c=>c.id===consultaId);const patient=panel.patients.find(p=>p.id===consult?.pacienteId);const [error,setError]=useState('');

  const [preview, setPreview] = useState(false);
  const [general, setGeneral] = useState('');
  const [drugs,setDrugs]=useState<Drug[]>([{id:1,name:'',presentation:'',instructions:'',frequency:'',duration:'',notes:''}]);
  const [saved, setSaved] = useState(false);
  const nextId = () => Math.max(...drugs.map(d => d.id), 0) + 1;

  const addDrug = () => setDrugs(ds => [...ds, { id: nextId(), name: '', presentation: '', instructions: '', frequency: '', duration: '', notes: '' }]);
  const removeDrug = (id: number) => setDrugs(ds => ds.filter(d => d.id !== id));
  const updateDrug = (id: number, key: keyof Drug, val: string) => setDrugs(ds => ds.map(d => d.id === id ? { ...d, [key]: val } : d));

  async function save(){setError('');if(!consult){setError('Seleccione una consulta.');return;}if(drugs.length<1||drugs.length>20||drugs.some(d=>![d.name,d.instructions,d.frequency,d.duration].every(v=>v.trim()))){setError('Complete medicamento, dosis, frecuencia y duración en cada fila (1 a 20 medicamentos).');return;}try{await mutate('/recetas',{consultaId,indicaciones:general,medicamentos:drugs.map(d=>({medicamento:d.name,presentacion:d.presentation,dosis:d.instructions,frecuencia:d.frequency,duracion:d.duration,indicaciones:d.notes}))});setSaved(true);setPreview(true);}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo guardar.');}}
  if (preview) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{saved?'Receta registrada':'Borrador de receta'}</h1>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => setPreview(false)}>{saved?'Volver':'Editar'}</button>
            <button className="btn btn-primary btn-sm" onClick={()=>window.print()}><Printer size={13} /> Imprimir / PDF</button>
          </div>
        </div>

        {/* Printed prescription view */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-6 border-b-2 border-blue-600" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="9" y="2" width="4" height="18" rx="2" fill="white" />
                    <rect x="2" y="9" width="18" height="4" rx="2" fill="white" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold text-base" style={{ fontFamily: 'DM Sans, sans-serif' }}>MediControl SV</div>
                  <div className="text-blue-200 text-xs">Sistema Integral de Consultorio</div>
                </div>
              </div>
              <div className="text-right text-blue-100 text-xs">
                <div className="font-semibold text-white">{consult?.medico||'—'}</div>
                <div>{panel.doctors.find(d=>d.nombre===consult?.medico)?.jvpm||'—'}</div>
                <div>{panel.clinic?.telefono||''}</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Patient info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-slate-500 text-xs">Paciente:</span>
                <div className="font-semibold text-slate-900">{consult?.paciente||'Seleccione paciente'}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Fecha:</span>
                <div className="font-semibold text-slate-900">{date(new Date().toISOString())}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Edad:</span>
                <div className="font-semibold text-slate-900">{patient?age(patient.fechaNacimiento):'—'} años</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Diagnóstico:</span>
                <div className="font-semibold text-slate-900">{consult?.diagnostico||'—'}</div>
              </div>
            </div>

            {/* Rx symbol */}
            <div className="text-4xl font-bold text-blue-800 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>℞</div>

            {/* Drugs */}
            <div className="space-y-4 mb-6">
              {drugs.map((d, i) => (
                <div key={d.id} className="border-b border-dashed border-slate-200 pb-4 last:border-0">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 text-sm w-5">{i + 1}.</span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{d.name} – {d.presentation}</div>
                      <div className="text-sm text-slate-700">{d.instructions}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Duración: {d.duration}{d.notes ? ` · ${d.notes}` : ''}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* General instructions */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="text-xs font-semibold text-blue-800 mb-1 uppercase tracking-wide">Indicaciones generales</div>
              <p className="text-sm text-slate-700">{general}</p>
            </div>

            {/* Signature */}
            <div className="flex justify-end">
              <div className="text-center">
                <div className="w-40 h-px bg-slate-400 mb-1" />
                <div className="text-xs text-slate-600 font-medium">{consult?.medico||'—'}</div>
                <div className="text-xs text-slate-400">{panel.doctors.find(d=>d.nombre===consult?.medico)?.jvpm||'—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">{error&&<p className="p-3 mb-4 bg-red-50 text-red-700" role="alert">{error}</p>}<div className="card p-4 mb-5"><label className="block text-sm mb-2">Consulta / paciente</label><select className="input-field" value={consultaId||''} disabled={saved} onChange={e=>setConsultaId(Number(e.target.value))}><option value="">Seleccionar consulta…</option>{panel.consultations.map(c=><option key={c.id} value={c.id}>#{c.id} · {c.paciente}</option>)}</select></div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Generar receta médica</h1>
          <p className="text-sm text-slate-500">{consult?.paciente||'Seleccione consulta'} · {date(new Date().toISOString())} · {consult?.medico||'—'}</p>
        </div>
        {saved && <span className="badge bg-green-100 text-green-700">✓ Guardada</span>}
      </div>

      <div className="space-y-4">
        {/* Drugs */}
        {drugs.map((d, idx) => (
          <div key={d.id} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Medicamento {idx + 1}</h3>
              {drugs.length > 1 && (
                <button className="text-red-400 hover:text-red-600 p-1" disabled={drugs.length===1||saved} onClick={() => removeDrug(d.id)}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Medicamento', placeholder: 'Ej. Losartán' },
                { key: 'presentation', label: 'Presentación', placeholder: 'Ej. Tabletas 50mg' },
                { key: 'instructions', label: 'Indicaciones', placeholder: 'Ej. 1 tableta cada 12 horas' },
                { key: 'frequency', label: 'Frecuencia', placeholder: 'Ej. Cada 8 horas' },
                { key: 'duration', label: 'Duración', placeholder: 'Ej. 30 días' },
                { key: 'notes', label: 'Observaciones', placeholder: 'Opcional...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                  <input
                    type="text"
                    readOnly={saved} maxLength={f.key==='name'?160:f.key==='notes'?500:100} className="input-field"
                    placeholder={f.placeholder}
                    value={(d as any)[f.key]}
                    onChange={e => updateDrug(d.id, f.key as keyof Drug, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="btn btn-secondary w-full justify-center border-dashed" disabled={drugs.length>=20||saved} onClick={addDrug}>
          <Plus size={14} />
          Agregar medicamento
        </button>

        {/* General instructions */}
        <div className="card p-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">Indicaciones generales</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            readOnly={saved} maxLength={1000} value={general}
            onChange={e => setGeneral(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="btn btn-secondary flex-1 justify-center" onClick={() => setPreview(true)}>
            <Eye size={14} />
            Vista previa
          </button>
          <button className="btn btn-primary flex-1 justify-center" disabled={busy||saved} onClick={save}>
            <Save size={14} />
            Guardar receta
          </button>
          <button className="btn btn-secondary" onClick={() => setPreview(true)}>
            <Printer size={14} />
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
