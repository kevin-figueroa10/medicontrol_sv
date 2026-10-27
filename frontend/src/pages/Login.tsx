import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginApi } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Ingresa un correo válido.';
    if (!password) e.password = 'La contraseña es obligatoria.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(loading)return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});setLoading(true);
    try {
      const result=await loginApi(email.trim(),password);
      sessionStorage.setItem('mc_token',result.token);
      sessionStorage.setItem('mc_role',result.rol);
      sessionStorage.setItem('mc_name',result.nombre);
      navigate(result.rol==='Medico'?'/doctor':result.rol==='Paciente'?'/patient':result.rol==='Recepcionista'?'/admin/waiting-room':'/admin',{replace:true});
    } catch (ex) {
      setErrors({password:ex instanceof Error?ex.message:'No se pudo iniciar sesión.'});
    } finally {setLoading(false);}
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)' }}
      >
        {/* Background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #93c5fd, transparent)', transform: 'translate(-30%,30%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
              <rect x="9" y="2" width="4" height="18" rx="2" fill="white" />
              <rect x="2" y="9" width="18" height="4" rx="2" fill="white" />
              <circle cx="11" cy="11" r="3" fill="#2563eb" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-lg" style={{ fontFamily: 'DM Sans, sans-serif' }}>MediControl SV</div>
            <div className="text-blue-300 text-xs">Sistema Integral de Consultorio</div>
          </div>
        </div>

        {/* Illustration content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <img
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop&auto=format"
            alt="Consultorio médico moderno"
            className="rounded-2xl w-full object-cover mb-8"
            style={{ maxHeight: 280 }}
          />
          <h2 className="text-white text-2xl font-bold mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Gestión clínica completa<br />en una sola plataforma
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            Centraliza pacientes, citas, expedientes clínicos, recetas y más. Diseñado para consultorios que buscan eficiencia y organización.
          </p>

          <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-white text-sm font-semibold">Atención segura y organizada</p>
            <p className="text-blue-100 text-xs mt-1">Agenda médica, expedientes y seguimiento de pacientes en un solo lugar.</p>
          </div>
        </div>

        <div className="relative z-10 text-blue-400 text-xs">
          © 2026 MediControl SV. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="9" y="2" width="4" height="18" rx="2" fill="white" />
                <rect x="2" y="9" width="18" height="4" rx="2" fill="white" />
              </svg>
            </div>
            <div className="font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>MediControl SV</div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Bienvenido de regreso
          </h1>
          <p className="text-slate-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                placeholder="usuario@medicontrol.sv"
                className={`input-field ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs">
                  <AlertCircle size={12} />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="••••••••"
                  className={`input-field pr-10 ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs">
                  <AlertCircle size={12} />
                  {errors.password}
                </div>
              )}
            </div>


            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full justify-center"
              style={{ width: '100%' }}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
              ) : null}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-xs text-center text-slate-500 mt-6">Acceso restringido a usuarios autorizados de MediControl SV.</p>
        </div>
      </div>
    </div>
  );
}
