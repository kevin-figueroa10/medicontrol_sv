import {useClinic,date,money,Row} from '../context/Clinic';
import {Modal} from './ClinicalUI';
import {appointmentStatus} from '../lib/appointmentStatus';
import {paymentSummary} from '../lib/paymentBalances';

export default function PatientAppointmentSummary({appointmentId,onClose}:{appointmentId:number;onClose:()=>void}){
 const {panel}=useClinic();
 // Only resolve records already scoped to this patient's session by the API.
 const appointment=panel.appointments.find(a=>a.id===appointmentId);
 if(!appointment)return null;
 const consultation=panel.consultations.find(c=>c.citaId===appointment.id&&c.pacienteId===appointment.pacienteId);
 const prescriptions=consultation?panel.prescriptions.filter(r=>r.consultaId===consultation.id&&!r.anulada):[];
 const payment=paymentSummary(appointment.precio,appointment.pagado);
 const fields=consultation?[
  ['Motivo de consulta',consultation.motivo],['Diagnóstico',consultation.diagnostico],
  ['Evaluación',consultation.evaluacion],['Tratamiento',consultation.tratamiento],['Recomendaciones',consultation.recomendaciones],
 ]:[];
 const vitals=consultation?.signos;
 return <Modal title={`Resumen de cita #${appointment.id}`} onClose={onClose}>
 <div className="space-y-5 text-sm">
 <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">{[
  ['Médico',appointment.medico],['Especialidad',appointment.especialidad],['Servicio',appointment.servicio],
  ['Fecha y hora',date(appointment.inicio,true)],['Estado de cita',appointmentStatus({estado:appointment.estado,inicio:appointment.inicio})],
 ].map(([label,value])=><div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="font-medium text-slate-800">{value||'—'}</dd></div>)}</dl>
 {payment&&appointment.estado==='Finalizada'&&<section className={`rounded-xl p-4 ${payment.saldo>0?'bg-amber-50 text-amber-900':'bg-green-50 text-green-900'}`}>
 <h3 className="font-semibold">Pago: {payment.estado}</h3>
 <dl className="grid grid-cols-3 gap-3 mt-2">{[['Total',payment.total],['Pagado',payment.pagado],['Saldo pendiente',payment.saldo]].map(([label,value])=><div key={label}><dt className="text-xs">{label}</dt><dd className="font-semibold">{money(value)}</dd></div>)}</dl>
 {payment.saldo>0&&<p className="text-xs mt-2">Su consulta finalizó y aún tiene saldo pendiente. Puede realizar el pago en recepción.</p>}
 </section>}
 <section><h3 className="font-semibold text-slate-900 mb-3">Resumen de atención</h3>
 {consultation?<dl className="space-y-3">{fields.map(([label,value])=><div key={label}><dt className="font-medium text-slate-700">{label}</dt><dd className="whitespace-pre-wrap break-words text-slate-600">{value||'No registrado.'}</dd></div>)}</dl>:<p className="text-slate-500">{appointment.estado==='Finalizada'?'No se encontró el resumen de la consulta. Consulte con el consultorio.':'Esta cita todavía no tiene una consulta registrada.'}</p>}
 </section>
 {vitals&&<section><h3 className="font-semibold text-slate-900 mb-2">Signos vitales registrados</h3><dl className="grid grid-cols-2 gap-3">{[
  ['Temperatura',vitals.temperatura==null?'—':`${vitals.temperatura} °C`],
  ['Presión arterial',vitals.presionSistolica&&vitals.presionDiastolica?`${vitals.presionSistolica}/${vitals.presionDiastolica} mmHg`:'—'],
  ['Frecuencia cardíaca',vitals.frecuenciaCardiaca==null?'—':`${vitals.frecuenciaCardiaca} lpm`],
  ['Saturación',vitals.saturacion==null?'—':`${vitals.saturacion}%`],
  ['Peso',vitals.pesoKg==null?'—':`${vitals.pesoKg} kg`],['Altura',vitals.alturaCm==null?'—':`${vitals.alturaCm} cm`],
 ].map(([label,value])=><div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd>{value}</dd></div>)}</dl></section>}
 {prescriptions.length>0&&<section><h3 className="font-semibold text-slate-900 mb-2">Recetas de esta consulta</h3>{prescriptions.map(r=><div key={r.id} className="border border-slate-200 rounded-xl p-3 mb-2"><ul className="space-y-2">{(r.medicamentos as Row[]).map((m,i)=><li key={i}><strong>{m.medicamento}</strong><p className="text-slate-600">{[m.dosis,m.frecuencia,m.duracion].filter(Boolean).join(' · ')}</p>{m.indicaciones&&<p className="text-slate-500">{m.indicaciones}</p>}</li>)}</ul>{r.indicaciones&&<p className="whitespace-pre-wrap mt-3">{r.indicaciones}</p>}</div>)}</section>}
 <button className="btn btn-secondary w-full" onClick={onClose}>Cerrar resumen</button>
 </div></Modal>;
}
