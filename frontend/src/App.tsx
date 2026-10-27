import {useEffect,useState,lazy,Suspense} from 'react';
import {BrowserRouter,Routes,Route,Navigate,Outlet,useNavigate,useLocation} from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import {api} from './lib/api';
import {ClinicProvider,useClinic,Session} from './context/Clinic';
const AdminDashboard=lazy(()=>import('./pages/admin/Dashboard'));
const Patients=lazy(()=>import('./pages/admin/Patients'));
const NewPatient=lazy(()=>import('./pages/admin/NewPatient'));
const PatientRecord=lazy(()=>import('./pages/admin/PatientRecord'));
const Doctors=lazy(()=>import('./pages/admin/Doctors'));
const Specialties=lazy(()=>import('./pages/admin/Specialties'));
const Agenda=lazy(()=>import('./pages/admin/Agenda'));
const BookAppointment=lazy(()=>import('./pages/admin/BookAppointment'));
const WaitingRoom=lazy(()=>import('./pages/admin/WaitingRoom'));
const Payments=lazy(()=>import('./pages/admin/Payments'));
const Reports=lazy(()=>import('./pages/admin/Reports'));
const Users=lazy(()=>import('./pages/admin/Users'));
const Audit=lazy(()=>import('./pages/admin/Audit'));
const Studies=lazy(()=>import('./pages/admin/Studies'));
const Followups=lazy(()=>import('./pages/admin/Followups'));
const Settings=lazy(()=>import('./pages/admin/Settings'));
const DoctorDashboard=lazy(()=>import('./pages/doctor/Dashboard'));
const Consultation=lazy(()=>import('./pages/doctor/Consultation'));
const Prescription=lazy(()=>import('./pages/doctor/Prescription'));
const ReceptionistDashboard=lazy(()=>import('./pages/receptionist/Dashboard'));
const PatientPortal=lazy(()=>import('./pages/patient/Portal'));
const PatientAppointments=lazy(()=>import('./pages/patient/Appointments'));
const PatientPrescriptions=lazy(()=>import('./pages/patient/Prescriptions'));
const PatientProfile=lazy(()=>import('./pages/patient/Profile'));
const home=(role:string)=>role==='Medico'?'/doctor':role==='Paciente'?'/patient':role==='Recepcionista'?'/receptionist':'/admin';
function ProtectedLayout(){const navigate=useNavigate();const [session,setSession]=useState<Session|null>(null),[error,setError]=useState('');useEffect(()=>{if(!sessionStorage.getItem('mc_token')){navigate('/login',{replace:true});return;}api<Session>('/auth/me').then(me=>{sessionStorage.setItem('mc_role',me.rol);sessionStorage.setItem('mc_name',me.nombre);setSession(me);}).catch(ex=>setError(ex instanceof Error?ex.message:'No se pudo verificar la sesión.'));},[navigate]);if(!session)return <div className="min-h-screen grid place-items-center p-6 text-slate-500">{error||'Verificando sesión…'}</div>;return <ClinicProvider session={session}><Layout><Outlet/></Layout></ClinicProvider>}
function Access({roles,children}:{roles:string[];children:React.ReactNode}){const {session}=useClinic();return roles.includes(session.rol)?children:<Navigate to={home(session.rol)} replace/>}
function PatientFormRoute(){const location=useLocation();return <NewPatient key={location.search}/>;}
function Home(){return <Navigate to={home(useClinic().session.rol)} replace/>}
const admin=['Administrador'],staff=['Administrador','Recepcionista'],medical=['Administrador','Medico','Paciente'],care=['Administrador','Recepcionista','Medico'];
export default function App(){return <BrowserRouter><Suspense fallback={<div className="p-8 text-slate-500">Cargando pantalla…</div>}><Routes><Route path="/login" element={<Login/>}/><Route element={<ProtectedLayout/>}>
<Route index element={<Home/>}/>
<Route path="/admin" element={<Access roles={admin}><AdminDashboard/></Access>}/>
<Route path="/receptionist" element={<Access roles={staff}><ReceptionistDashboard/></Access>}/>
<Route path="/admin/patients" element={<Access roles={care}><Patients/></Access>}/>
<Route path="/admin/patients/new" element={<Access roles={staff}><PatientFormRoute/></Access>}/>
<Route path="/admin/patients/record" element={<Access roles={care}><PatientRecord/></Access>}/>
<Route path="/admin/doctors" element={<Access roles={admin}><Doctors/></Access>}/>
<Route path="/admin/specialties" element={<Access roles={admin}><Specialties/></Access>}/>
<Route path="/admin/agenda" element={<Access roles={care}><Agenda/></Access>}/>
<Route path="/admin/book" element={<Access roles={staff}><BookAppointment/></Access>}/>
<Route path="/admin/waiting-room" element={<Access roles={care}><WaitingRoom/></Access>}/>
<Route path="/admin/payments" element={<Access roles={staff}><Payments/></Access>}/>
<Route path="/admin/reports" element={<Access roles={staff}><Reports/></Access>}/>
<Route path="/admin/users" element={<Access roles={admin}><Users/></Access>}/>
<Route path="/admin/audit" element={<Access roles={admin}><Audit/></Access>}/>
<Route path="/admin/settings" element={<Access roles={admin}><Settings/></Access>}/>
<Route path="/admin/studies" element={<Access roles={['Administrador','Medico']}><Studies/></Access>}/>
<Route path="/admin/followups" element={<Access roles={['Administrador','Medico']}><Followups/></Access>}/>
<Route path="/doctor" element={<Access roles={['Medico']}><DoctorDashboard/></Access>}/>
<Route path="/doctor/consultation" element={<Access roles={['Medico']}><Consultation/></Access>}/>
<Route path="/doctor/prescription" element={<Access roles={['Medico']}><Prescription/></Access>}/>
<Route path="/patient" element={<Access roles={['Paciente']}><PatientPortal/></Access>}/>
<Route path="/patient/appointments" element={<Access roles={['Paciente']}><PatientAppointments/></Access>}/>
<Route path="/patient/book" element={<Access roles={['Paciente']}><BookAppointment/></Access>}/>
<Route path="/patient/prescriptions" element={<Access roles={medical}><PatientPrescriptions/></Access>}/>
<Route path="/patient/studies" element={<Access roles={['Paciente']}><Studies/></Access>}/>
<Route path="/patient/followups" element={<Access roles={['Paciente']}><Followups/></Access>}/>
<Route path="/patient/profile" element={<Access roles={['Paciente']}><PatientProfile/></Access>}/>
<Route path="*" element={<Home/>}/>
</Route></Routes></Suspense></BrowserRouter>}
