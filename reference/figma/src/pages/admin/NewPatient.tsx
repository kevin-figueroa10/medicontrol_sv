import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  sex: string;
  docId: string;
  phone: string;
  email: string;
  address: string;
  emergName: string;
  emergRelation: string;
  emergPhone: string;
  notes: string;
}

const initial: FormData = {
  firstName: '', lastName: '', dob: '', sex: '', docId: '',
  phone: '', email: '', address: '',
  emergName: '', emergRelation: '', emergPhone: '',
  notes: '',
};

type Errors = Partial<Record<keyof FormData, string>>;

export default function NewPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = 'Obligatorio';
    if (!form.lastName.trim()) e.lastName = 'Obligatorio';
    if (!form.dob) e.dob = 'Obligatorio';
    if (!form.sex) e.sex = 'Obligatorio';
    if (!form.docId.trim()) e.docId = 'Obligatorio';
    if (!form.phone.trim()) e.phone = 'Obligatorio';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    if (!form.emergName.trim()) e.emergName = 'Obligatorio';
    if (!form.emergRelation.trim()) e.emergRelation = 'Obligatorio';
    if (!form.emergPhone.trim()) e.emergPhone = 'Obligatorio';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSaved(true);
  };

  const Field = ({ label, k, type = 'text', placeholder = '', required = false }: { label: string; k: keyof FormData; type?: string; placeholder?: string; required?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        className={`input-field ${errors[k] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[k]}
        onChange={set(k)}
      />
      {errors[k] && (
        <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
          <AlertCircle size={11} /> {errors[k]}
        </div>
      )}
    </div>
  );

  if (saved) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Paciente registrado correctamente
          </h2>
          <p className="text-slate-500 text-sm mb-2">
            <strong>{form.firstName} {form.lastName}</strong> ha sido agregado al sistema.
          </p>
          <div className="flex gap-3 mt-6 justify-center">
            <button className="btn btn-secondary" onClick={() => { setForm(initial); setErrors({}); setSaved(false); }}>
              Registrar otro
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/admin/patients')}>
              Ver lista de pacientes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
        <button className="hover:text-blue-600" onClick={() => navigate('/admin/patients')}>Pacientes</button>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Nuevo paciente</span>
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>Registrar paciente</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Datos personales */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 text-sm mb-5 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            Datos personales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombres" k="firstName" placeholder="Ej. Carlos Alberto" required />
            <Field label="Apellidos" k="lastName" placeholder="Ej. Mendoza García" required />
            <Field label="Fecha de nacimiento" k="dob" type="date" required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Sexo <span className="text-red-500">*</span>
              </label>
              <select className={`input-field ${errors.sex ? 'error' : ''}`} value={form.sex} onChange={set('sex')}>
                <option value="">Seleccionar...</option>
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Otro</option>
              </select>
              {errors.sex && <div className="flex items-center gap-1 mt-1 text-red-600 text-xs"><AlertCircle size={11} /> {errors.sex}</div>}
            </div>
            <Field label="Documento de identificación" k="docId" placeholder="Ej. 01234567-8" required />
            <Field label="Teléfono" k="phone" placeholder="Ej. 7654-3210" required />
            <Field label="Correo electrónico" k="email" type="email" placeholder="correo@email.com" />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección</label>
              <input type="text" className="input-field" placeholder="Calle, colonia, ciudad" value={form.address} onChange={set('address')} />
            </div>
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 text-sm mb-5 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">2</span>
            Contacto de emergencia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Nombre completo" k="emergName" placeholder="Nombre del contacto" required />
            <Field label="Parentesco" k="emergRelation" placeholder="Ej. Esposa, madre, hijo" required />
            <Field label="Teléfono" k="emergPhone" placeholder="Ej. 7890-1234" required />
          </div>
        </div>

        {/* Información adicional */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">3</span>
            Información adicional
          </h2>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Alergias conocidas, condiciones preexistentes, observaciones generales..."
            value={form.notes}
            onChange={set('notes')}
          />
        </div>

        <div className="flex gap-3">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/patients')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar paciente
          </button>
        </div>
      </form>
    </div>
  );
}
