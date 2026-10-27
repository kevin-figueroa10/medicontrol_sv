import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Calendar, CalendarDays,
  ClipboardList, FileText, FlaskConical, Activity, CreditCard,
  BarChart3, Settings, Shield, Bell, LogOut, Menu, X,
  ChevronDown, Search, UserCircle, Stethoscope, Clock,
  BookOpen, Home
} from 'lucide-react';

type Role = 'admin' | 'doctor' | 'receptionist' | 'patient';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/admin' },
    { label: 'Pacientes', icon: <Users size={16} />, path: '/admin/patients' },
    { label: 'Médicos', icon: <Stethoscope size={16} />, path: '/admin/doctors' },
    { label: 'Especialidades', icon: <ClipboardList size={16} />, path: '/admin/specialties' },
    { label: 'Citas', icon: <Calendar size={16} />, path: '/admin/agenda' },
    { label: 'Sala de espera', icon: <Clock size={16} />, path: '/admin/waiting-room' },
    { label: 'Pagos', icon: <CreditCard size={16} />, path: '/admin/payments' },
    { label: 'Reportes', icon: <BarChart3 size={16} />, path: '/admin/reports' },
    { label: 'Usuarios', icon: <Shield size={16} />, path: '/admin/users' },
    { label: 'Auditoría', icon: <BookOpen size={16} />, path: '/admin/audit' },
    { label: 'Configuración', icon: <Settings size={16} />, path: '/admin/settings' },
  ],
  doctor: [
    { label: 'Inicio', icon: <Home size={16} />, path: '/doctor' },
    { label: 'Mi agenda', icon: <Calendar size={16} />, path: '/admin/agenda' },
    { label: 'Mis pacientes', icon: <Users size={16} />, path: '/admin/patients' },
    { label: 'Sala de espera', icon: <Clock size={16} />, path: '/admin/waiting-room' },
    { label: 'Consultas', icon: <ClipboardList size={16} />, path: '/doctor/consultation' },
    { label: 'Recetas', icon: <FileText size={16} />, path: '/doctor/prescription' },
    { label: 'Estudios', icon: <FlaskConical size={16} />, path: '/admin/studies' },
    { label: 'Seguimientos', icon: <Activity size={16} />, path: '/admin/followups' },
  ],
  receptionist: [
    { label: 'Inicio', icon: <Home size={16} />, path: '/receptionist' },
    { label: 'Pacientes', icon: <Users size={16} />, path: '/admin/patients' },
    { label: 'Citas', icon: <Calendar size={16} />, path: '/admin/agenda' },
    { label: 'Sala de espera', icon: <Clock size={16} />, path: '/admin/waiting-room' },
    { label: 'Pagos', icon: <CreditCard size={16} />, path: '/admin/payments' },
  ],
  patient: [
    { label: 'Inicio', icon: <Home size={16} />, path: '/patient' },
    { label: 'Mis citas', icon: <Calendar size={16} />, path: '/patient/appointments' },
    { label: 'Agendar cita', icon: <CalendarDays size={16} />, path: '/patient/book' },
    { label: 'Mis recetas', icon: <FileText size={16} />, path: '/patient/prescriptions' },
    { label: 'Mis estudios', icon: <FlaskConical size={16} />, path: '/patient/studies' },
    { label: 'Seguimientos', icon: <Activity size={16} />, path: '/patient/followups' },
    { label: 'Mi perfil', icon: <UserCircle size={16} />, path: '/patient/profile' },
  ],
};

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  doctor: 'Médico',
  receptionist: 'Recepcionista',
  patient: 'Paciente',
};

const roleUsers: Record<Role, { name: string; initials: string }> = {
  admin: { name: 'Sofía Ramírez', initials: 'SR' },
  doctor: { name: 'Dr. Eduardo Vega', initials: 'EV' },
  receptionist: { name: 'María Pérez', initials: 'MP' },
  patient: { name: 'Carlos Mendoza', initials: 'CM' },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('admin');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const nav = navByRole[role];
  const user = roleUsers[role];

  const notifications = [
    { id: 1, title: 'Cita confirmada', desc: 'Carlos Mendoza – 10:30 AM', time: 'hace 5 min', read: false },
    { id: 2, title: 'Resultado disponible', desc: 'Hemograma – Ana Martínez', time: 'hace 1 h', read: false },
    { id: 3, title: 'Seguimiento próximo', desc: 'Roberto Flores – mañana', time: 'hace 2 h', read: true },
    { id: 4, title: 'Cita reprogramada', desc: 'Luis Hernández – 15 sep', time: 'ayer', read: true },
  ];

  const unread = notifications.filter(n => !n.read).length;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="9" y="2" width="4" height="18" rx="2" fill="white" />
              <rect x="2" y="9" width="18" height="4" rx="2" fill="white" />
              <circle cx="11" cy="11" r="3" fill="#2563eb" />
            </svg>
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>MediControl</div>
            <div className="text-blue-400 text-xs">SV</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {nav.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user.name}</div>
            <div className="text-slate-400 text-xs">{roleLabels[role]}</div>
          </div>
        </div>
        <button
          className="sidebar-nav-item mt-1 text-red-400 hover:text-red-300"
          onClick={() => navigate('/login')}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 flex flex-col transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0f172a' }}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pacientes, citas..."
              className="bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400 w-full"
            />
          </div>

          <div className="flex-1" />

          {/* Role switcher */}
          <div className="relative">
            <button
              className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            >
              <UserCheck size={14} />
              <span className="hidden sm:inline">{roleLabels[role]}</span>
              <ChevronDown size={13} />
            </button>
            {roleMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 w-44 py-1">
                {(Object.keys(roleLabels) as Role[]).map(r => (
                  <button
                    key={r}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${role === r ? 'text-blue-600 font-medium' : 'text-slate-700'}`}
                    onClick={() => {
                      setRole(r);
                      setRoleMenuOpen(false);
                      if (r === 'patient') navigate('/patient');
                      else if (r === 'doctor') navigate('/doctor');
                      else if (r === 'receptionist') navigate('/receptionist');
                      else navigate('/admin');
                    }}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-80">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Notificaciones</span>
                  <span className="text-xs text-blue-600 cursor-pointer hover:underline">Marcar todo como leído</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-slate-300' : 'bg-blue-500'}`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800">{n.title}</div>
                          <div className="text-xs text-slate-500">{n.desc}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{n.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
            {user.initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
