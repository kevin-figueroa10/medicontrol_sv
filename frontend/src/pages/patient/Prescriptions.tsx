import {useClinic,date,Row} from '../../context/Clinic';
import { useState } from 'react';
import { Printer, ChevronDown, ChevronUp, FileText } from 'lucide-react';


export default function PatientPrescriptions() {
 const {panel}=useClinic();const prescriptions=panel.prescriptions.filter(r=>!r.anulada).map(r=>({id:`REC-${r.id}`,patient:String(r.paciente),date:date(r.fechaUtc),doctor:String(r.medico),specialty:String(r.especialidad),consult:`Consulta #${r.consultaId}`,meds:(r.medicamentos as Row[]).map(m=>({name:String(m.medicamento),presentation:String(m.presentacion),instructions:`${m.dosis} · ${m.frecuencia}`,duration:String(m.duracion),notes:String(m.indicaciones)})),general:String(r.indicaciones)}));

  const [expanded, setExpanded] = useState<string | null>(prescriptions[0]?.id||null);
  const [preview, setPreview] = useState<typeof prescriptions[0] | null>(null);

  if (preview) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Receta {preview.id}</h1>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => setPreview(null)}>← Volver</button>
            <button className="btn btn-primary btn-sm" onClick={()=>window.print()}><Printer size={13} /> Imprimir / PDF</button>
          </div>
        </div>
        <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b-2 border-blue-600" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                    <rect x="9" y="2" width="4" height="18" rx="2" fill="white" />
                    <rect x="2" y="9" width="18" height="4" rx="2" fill="white" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>MediControl SV</div>
                  <div className="text-blue-200 text-xs">Sistema Integral</div>
                </div>
              </div>
              <div className="text-right text-blue-100 text-xs">
                <div className="font-semibold text-white">{preview.doctor}</div>
                <div>{preview.specialty}</div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
              <div><span className="text-xs text-slate-500">Paciente:</span><div className="font-semibold text-slate-900">{preview.patient}</div></div>
              <div><span className="text-xs text-slate-500">Fecha:</span><div className="font-semibold text-slate-900">{preview.date}</div></div>
            </div>
            <div className="text-4xl font-bold text-blue-800 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>℞</div>
            <div className="space-y-3 mb-5">
              {preview.meds.map((m, i) => (
                <div key={i} className="border-b border-dashed border-slate-200 pb-3 last:border-0">
                  <div className="font-bold text-sm text-slate-900">{i+1}. {m.name} – {m.presentation}</div>
                  <div className="text-sm text-slate-700">{m.instructions}</div>
                  <div className="text-xs text-slate-500">Duración: {m.duration}{m.notes ? ` · ${m.notes}` : ''}</div>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Indicaciones generales</div>
              <p className="text-sm text-slate-700">{preview.general}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-md">
      <h1 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mis recetas</h1>

      <div className="space-y-3">
        {!prescriptions.length&&<div className="card p-8 text-center text-slate-500 text-sm">No hay recetas registradas.</div>}{prescriptions.map(rx => (
          <div key={rx.id} className="card overflow-hidden">
            <button
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-800">{rx.date} · {rx.doctor}</div>
                  <div className="text-xs text-slate-500">{rx.specialty} · {rx.consult} · {rx.meds.length} medicamento{rx.meds.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-green-100 text-green-700 text-xs">{rx.id}</span>
                {expanded === rx.id ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
              </div>
            </button>

            {expanded === rx.id && (
              <div className="border-t border-slate-100 px-5 pb-5">
                <div className="py-4 space-y-3">
                  {rx.meds.map((m, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{m.name} – {m.presentation}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{m.instructions}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Duración: {m.duration}{m.notes ? ` · ${m.notes}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-xl p-3 mb-4">
                  <div className="text-xs font-semibold text-blue-800 mb-1">Indicaciones generales</div>
                  <p className="text-xs text-slate-700">{rx.general}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => setPreview(rx)}>
                    <FileText size={12} /> Ver receta completa
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setPreview(rx)}>
                    <Printer size={12} /> Imprimir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
