import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, KeyRound, Eye, EyeOff } from 'lucide-react';

type Step = 'email' | 'sent' | 'reset' | 'done';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Ingresa un correo válido.'); return; }
    setError('');
    setStep('sent');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setError('');
    setStep('done');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
              <rect x="9" y="2" width="4" height="18" rx="2" fill="white" />
              <rect x="2" y="9" width="18" height="4" rx="2" fill="white" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-lg" style={{ fontFamily: 'DM Sans, sans-serif' }}>MediControl SV</div>
            <div className="text-blue-300 text-xs">Sistema Integral de Consultorio</div>
          </div>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <KeyRound size={40} className="text-blue-300" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Recuperación segura</h2>
          <p className="text-blue-200 text-sm max-w-xs mx-auto">Te enviaremos un enlace a tu correo para que puedas restablecer tu contraseña de forma segura.</p>
        </div>
        <div className="text-blue-400 text-xs text-center">© 2026 MediControl SV. Todos los derechos reservados.</div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <button
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-8"
            onClick={() => step === 'email' ? navigate('/login') : setStep('email')}
          >
            <ArrowLeft size={15} /> Volver al inicio de sesión
          </button>

          {step === 'email' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>¿Olvidaste tu contraseña?</h1>
              <p className="text-slate-500 text-sm mb-8">Ingresa tu correo y te enviaremos las instrucciones.</p>
              <form onSubmit={handleSend} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="usuario@medicontrol.sv"
                      className={`input-field pl-10 ${error ? 'error' : ''}`}
                    />
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-full justify-center">Enviar instrucciones</button>
              </form>
            </>
          )}

          {step === 'sent' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Correo enviado</h1>
              <p className="text-slate-500 text-sm mb-2">Hemos enviado las instrucciones a:</p>
              <p className="font-semibold text-slate-800 mb-6">{email}</p>
              <p className="text-slate-500 text-xs mb-6">Revisa tu bandeja de entrada y la carpeta de spam. El enlace expira en 30 minutos.</p>
              <button className="btn btn-primary w-full justify-center mb-3" onClick={() => setStep('reset')}>
                Simular: Crear nueva contraseña
              </button>
              <button className="btn btn-ghost w-full justify-center text-slate-500" onClick={() => navigate('/login')}>
                Volver al inicio
              </button>
            </div>
          )}

          {step === 'reset' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Crear nueva contraseña</h1>
              <p className="text-slate-500 text-sm mb-8">La contraseña debe tener al menos 8 caracteres.</p>
              <form onSubmit={handleReset} className="space-y-5">
                {[
                  { label: 'Nueva contraseña', val: password, setVal: setPassword, placeholder: '••••••••' },
                  { label: 'Confirmar contraseña', val: confirm, setVal: setConfirm, placeholder: '••••••••' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={f.val}
                        onChange={e => { f.setVal(e.target.value); setError(''); }}
                        placeholder={f.placeholder}
                        className={`input-field pr-10 ${error ? 'error' : ''}`}
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPass(s => !s)}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button type="submit" className="btn btn-primary btn-lg w-full justify-center">Guardar nueva contraseña</button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>¡Contraseña actualizada!</h1>
              <p className="text-slate-500 text-sm mb-6">Tu contraseña ha sido cambiada exitosamente.</p>
              <button className="btn btn-primary w-full justify-center" onClick={() => navigate('/login')}>
                Ir al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
