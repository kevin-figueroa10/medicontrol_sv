import PatientPhoto from '../../components/PatientPhoto';
import {useClinic,initials} from '../../context/Clinic';
import {PasswordForm} from '../../components/PasswordForm';
import { useState } from 'react';
import { Save, CheckCircle, Edit3 } from 'lucide-react';

export default function PatientProfile() {const {panel,session,mutate}=useClinic();const patient=panel.patients[0];const [error,setError]=useState('');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form,setForm]=useState({firstName:patient?.nombre||session.nombre,lastName:'',dob:patient?.fechaNacimiento||'',phone:patient?.telefono||'',email:patient?.correo||'',address:patient?.direccion||'',emergName:patient?.contacto?.nombre||'',emergRelation:patient?.contacto?.parentesco||'',emergPhone:patient?.contacto?.telefono||''});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave=async()=>{if(!patient)return;setError('');try{await mutate('/perfil',{nombre:patient.nombre,documento:patient.documento,fechaNacimiento:patient.fechaNacimiento,sexo:patient.sexo,notas:patient.notas,telefono:form.phone,correo:form.email,direccion:form.address,contactoNombre:form.emergName,contactoTelefono:form.emergPhone,parentesco:form.emergRelation},'PUT');setEditing(false);setSaved(true);}catch(ex){setError(ex instanceof Error?ex.message:'No se pudo guardar.');}};

  return (
    <div className="p-6 max-w-2xl">{error&&<p className="p-3 text-red-700 mb-4" role="alert">{error}</p>}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mi perfil</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1.5 text-green-600 text-sm"><CheckCircle size={15} /> Guardado</span>}
          {!editing
            ? <button disabled={!patient} className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}><Edit3 size={13} /> Editar</button>
            : <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={13} /> Guardar cambios</button>}
        </div>
      </div>

      {/* Avatar */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-5">
          {patient&&<PatientPhoto patient={patient} editable/>}
          <div>
            <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{form.firstName} {form.lastName}</h2>
            <div className="text-sm text-slate-500">{patient?`Código: PAC-${patient.id}`:'Tu cuenta aún no está vinculada a un expediente. Contacta a recepción.'}</div>
            <span className="badge bg-green-100 text-green-700 text-xs mt-1">Paciente activo</span>
          </div>
        </div>
      </div>

      {/* Personal data */}
      <div className="card p-6 mb-5">
        <h2 className="font-semibold text-slate-900 text-sm mb-5 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
          Datos personales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Nombres', key: 'firstName' },
            { label: 'Apellidos', key: 'lastName' },
            { label: 'Fecha de nacimiento', key: 'dob', type: 'date' },
            { label: 'Teléfono', key: 'phone' },
            { label: 'Correo electrónico', key: 'email', type: 'email' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
              {editing ? (
                <input readOnly={['firstName','lastName','dob'].includes(f.key)} maxLength={f.key==='phone'?20:200} type={f.type ?? 'text'} className="input-field" value={(form as any)[f.key]} onChange={set(f.key as keyof typeof form)} />
              ) : (
                <div className="text-sm text-slate-800 py-2">{(form as any)[f.key] || '–'}</div>
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Dirección</label>
            {editing ? (
              <input type="text" maxLength={300} className="input-field" value={form.address} onChange={set('address')} />
            ) : (
              <div className="text-sm text-slate-800 py-2">{form.address || '–'}</div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency contact */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 text-sm mb-5 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">2</span>
          Contacto de emergencia
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Nombre', key: 'emergName' },
            { label: 'Parentesco', key: 'emergRelation' },
            { label: 'Teléfono', key: 'emergPhone' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
              {editing ? (
                <input type="text" className="input-field" value={(form as any)[f.key]} onChange={set(f.key as keyof typeof form)} />
              ) : (
                <div className="text-sm text-slate-800 py-2">{(form as any)[f.key] || '–'}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="flex gap-3 mt-5">
          <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><Save size={14} /> Guardar cambios</button>
        </div>
      )}
      <div className="card p-6 mt-5"><h2 className="font-semibold text-sm mb-5">Seguridad de mi cuenta</h2><PasswordForm/></div>
    </div>
  );
}
