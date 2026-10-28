import {useState} from 'react';
import {useClinic,Row,day,money} from '../context/Clinic';
import {Field} from './ClinicalUI';
export function ActionForm({children,onSave,onClose,label='Guardar'}:{children:React.ReactNode;onSave:()=>Promise<void>;onClose:()=>void;label?:string}){
 const [error,setError]=useState(''),[saving,setSaving]=useState(false);
 return <form onSubmit={async e=>{e.preventDefault();if(saving)return;setSaving(true);setError('');try{await onSave();onClose();}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo guardar.');}finally{setSaving(false);}}} className="space-y-4">{children}{error&&<p role="alert" className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</p>}<footer className="flex gap-3 pt-3"><button type="button" className="btn btn-secondary flex-1" disabled={saving} onClick={onClose}>Cancelar</button><button className="btn btn-primary flex-1" disabled={saving}>{saving?'Guardando…':label}</button></footer></form>
}
export function UserForm({edit,onClose}:{edit?:Row;onClose:()=>void}){
 const {panel,mutate}=useClinic();const [confirmation,setConfirmation]=useState('');const [form,setForm]=useState({nombre:edit?.nombre||'',correo:edit?.correo||'',password:'',rol:edit?.rol||'Recepcionista',pacienteId:''});
 const set=(key:string,value:string)=>setForm(p=>({...p,[key]:value}));
 return <ActionForm onClose={onClose} onSave={async()=>{if(!edit&&(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(form.password)||new TextEncoder().encode(form.password).length>72))throw new Error('Use 12 caracteres o más, mayúscula, minúscula, número y símbolo; máximo 72 bytes.');if(!edit&&form.password!==confirmation)throw new Error('Las contraseñas no coinciden.');const result=await mutate(edit?`/usuarios/${edit.id}`:'/usuarios',{...form,pacienteId:form.pacienteId?Number(form.pacienteId):null},edit?'PUT':'POST');if(edit&&form.pacienteId)await mutate(`/pacientes/${form.pacienteId}/vincular/${edit?.id||result.id}`,undefined);}}>
 <Field label="Nombre completo"><input className="input-field" required maxLength={160} value={form.nombre} onChange={e=>set('nombre',e.target.value)}/></Field>
 <Field label="Correo electrónico"><input type="email" className="input-field" required maxLength={200} value={form.correo} onChange={e=>set('correo',e.target.value)}/></Field>
 {!edit&&<Field label="Contraseña inicial"><input type="password" autoComplete="new-password" className="input-field" required minLength={12} maxLength={72} value={form.password} onChange={e=>set('password',e.target.value)}/><span className="text-xs text-slate-500">Mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.</span></Field>}
 {!edit&&<Field label="Confirmar contraseña"><input type="password" autoComplete="new-password" className="input-field" required minLength={12} maxLength={72} value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></Field>}
 <Field label="Rol"><select className="input-field" value={form.rol} onChange={e=>set('rol',e.target.value)}>{['Administrador','Medico','Recepcionista','Paciente','Laboratorio'].map(r=><option key={r} value={r}>{r==='Medico'?'Médico':r}</option>)}</select></Field>
 {form.rol==='Paciente'&&<Field label="Vincular a expediente"><select className="input-field" value={form.pacienteId} onChange={e=>set('pacienteId',e.target.value)}><option value="">Sin vincular por ahora</option>{panel.patients.filter(p=>!p.usuarioId||p.usuarioId===edit?.id).map(p=><option key={p.id} value={p.id}>{p.nombre} · {p.documento}</option>)}</select></Field>}
 </ActionForm>
}
export function UserPasswordForm({user,onClose}:{user:Row;onClose:()=>void}){
 const {mutate}=useClinic();const [nueva,setNueva]=useState(''),[confirmacion,setConfirmacion]=useState('');
 return <ActionForm onClose={onClose} label="Cambiar contraseña" onSave={async()=>{
  if(nueva.length<12||new TextEncoder().encode(nueva).length>72||!/[A-Z]/.test(nueva)||!/[a-z]/.test(nueva)||!/[0-9]/.test(nueva)||!/[\W_]/.test(nueva))throw new Error('Use al menos 12 caracteres, mayúscula, minúscula, número y símbolo; máximo 72 bytes.');
  if(nueva!==confirmacion)throw new Error('Las contraseñas no coinciden.');
  await mutate(`/usuarios/${user.id}/password`,{nueva,confirmacion},'PUT');
 }}>
 <p className="text-sm text-slate-600">Cambiar la contraseña de <strong>{user.nombre}</strong> ({user.correo}).</p>
 <Field label="Nueva contraseña"><input className="input-field" type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={nueva} onChange={e=>setNueva(e.target.value)}/></Field>
 <p className="text-xs text-slate-500">Mínimo 12 caracteres, mayúscula, minúscula, número y símbolo. Máximo 72 bytes.</p>
 <Field label="Confirmar contraseña"><input className="input-field" type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={confirmacion} onChange={e=>setConfirmacion(e.target.value)}/></Field>
 </ActionForm>;
}
export function PaymentForm({onClose,citaId}:{onClose:()=>void;citaId?:number}){
 const {panel,mutate}=useClinic();const selected=panel.appointments.find(a=>a.id===citaId);const [form,setForm]=useState({citaId:selected?String(selected.id):'',monto:selected?(Math.round(Number(selected.precio)*100-Number(selected.pagado)*100)/100).toFixed(2):'',metodo:'Efectivo',referencia:''});const cita=panel.appointments.find(a=>a.id===Number(form.citaId));
 return <ActionForm onClose={onClose} label="Registrar pago" onSave={async()=>{await mutate('/pagos',{...form,citaId:Number(form.citaId),monto:Number(form.monto)});}}>
 <Field label="Paciente / cita"><select required className="input-field" value={form.citaId} onChange={e=>{const a=panel.appointments.find(a=>a.id===Number(e.target.value));setForm(p=>({...p,citaId:e.target.value,monto:a?String(Number(a.precio)-Number(a.pagado)):''}));}}><option value="">Seleccionar cita…</option>{panel.appointments.filter(a=>!['Cancelada','No asistió'].includes(a.estado)&&Number(a.precio)>Number(a.pagado)).map(a=><option key={a.id} value={a.id}>#{a.id} · {a.paciente} · {a.servicio} · {money(Number(a.precio)-Number(a.pagado))}</option>)}</select></Field>
 {cita&&<p className="text-sm text-blue-700">Saldo pendiente: {money(Number(cita.precio)-Number(cita.pagado))}</p>}
 <Field label="Monto ($)"><input className="input-field" type="number" required min="0.01" step="0.01" max={cita?Number(cita.precio)-Number(cita.pagado):100000} value={form.monto} onChange={e=>setForm(p=>({...p,monto:e.target.value}))}/></Field>
 <Field label="Método de pago"><select className="input-field" value={form.metodo} onChange={e=>setForm(p=>({...p,metodo:e.target.value}))}>{['Efectivo','Tarjeta','Transferencia'].map(m=><option key={m}>{m}</option>)}</select></Field>
 <Field label="Referencia"><input className="input-field" required={form.metodo!=='Efectivo'} maxLength={100} value={form.referencia} onChange={e=>setForm(p=>({...p,referencia:e.target.value}))}/></Field>
 </ActionForm>
}
export function ClinicalOrderForm({kind,onClose}:{kind:'study'|'followup';onClose:()=>void}){
 const {panel,mutate}=useClinic();const [form,setForm]=useState({consultaId:'',tipo:'',motivo:'',fecha:'',indicaciones:''});const set=(key:string,value:string)=>setForm(p=>({...p,[key]:value}));
 return <ActionForm onClose={onClose} onSave={async()=>{await mutate(kind==='study'?'/estudios':'/seguimientos',{...form,consultaId:Number(form.consultaId)});}}>
 <Field label="Consulta / paciente"><select className="input-field" required value={form.consultaId} onChange={e=>set('consultaId',e.target.value)}><option value="">Seleccionar consulta…</option>{panel.consultations.map(c=><option key={c.id} value={c.id}>#{c.id} · {c.paciente} · {c.diagnostico}</option>)}</select></Field>
 {kind==='study'?<Field label="Tipo de estudio"><input required maxLength={140} className="input-field" value={form.tipo} onChange={e=>set('tipo',e.target.value)}/></Field>:<><Field label="Motivo del seguimiento"><input className="input-field" required maxLength={500} value={form.motivo} onChange={e=>set('motivo',e.target.value)}/></Field><Field label="Fecha recomendada"><input className="input-field" type="date" required min={day()} value={form.fecha} onChange={e=>set('fecha',e.target.value)}/></Field></>}
 <Field label="Indicaciones"><textarea className="input-field" maxLength={kind==='study'?1000:1500} rows={3} value={form.indicaciones} onChange={e=>set('indicaciones',e.target.value)}/></Field>
 </ActionForm>
}
