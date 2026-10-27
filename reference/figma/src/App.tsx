import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import Patients from './pages/admin/Patients';
import NewPatient from './pages/admin/NewPatient';
import PatientRecord from './pages/admin/PatientRecord';
import Doctors from './pages/admin/Doctors';
import Specialties from './pages/admin/Specialties';
import Agenda from './pages/admin/Agenda';
import BookAppointment from './pages/admin/BookAppointment';
import WaitingRoom from './pages/admin/WaitingRoom';
import Payments from './pages/admin/Payments';
import Reports from './pages/admin/Reports';
import Users from './pages/admin/Users';
import Audit from './pages/admin/Audit';
import Studies from './pages/admin/Studies';
import Followups from './pages/admin/Followups';
import Settings from './pages/admin/Settings';

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import Consultation from './pages/doctor/Consultation';
import Prescription from './pages/doctor/Prescription';

// Receptionist
import ReceptionistDashboard from './pages/receptionist/Dashboard';

// Patient
import PatientPortal from './pages/patient/Portal';
import PatientAppointments from './pages/patient/Appointments';
import PatientBookAppointment from './pages/patient/BookAppointment';
import PatientPrescriptions from './pages/patient/Prescriptions';
import PatientStudies from './pages/patient/PatientStudies';
import PatientFollowups from './pages/patient/PatientFollowups';
import PatientProfile from './pages/patient/Profile';

function WithLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin routes */}
        <Route path="/admin" element={<WithLayout><AdminDashboard /></WithLayout>} />
        <Route path="/admin/patients" element={<WithLayout><Patients /></WithLayout>} />
        <Route path="/admin/patients/new" element={<WithLayout><NewPatient /></WithLayout>} />
        <Route path="/admin/patients/record" element={<WithLayout><PatientRecord /></WithLayout>} />
        <Route path="/admin/doctors" element={<WithLayout><Doctors /></WithLayout>} />
        <Route path="/admin/specialties" element={<WithLayout><Specialties /></WithLayout>} />
        <Route path="/admin/agenda" element={<WithLayout><Agenda /></WithLayout>} />
        <Route path="/admin/book" element={<WithLayout><BookAppointment /></WithLayout>} />
        <Route path="/admin/waiting-room" element={<WithLayout><WaitingRoom /></WithLayout>} />
        <Route path="/admin/payments" element={<WithLayout><Payments /></WithLayout>} />
        <Route path="/admin/reports" element={<WithLayout><Reports /></WithLayout>} />
        <Route path="/admin/users" element={<WithLayout><Users /></WithLayout>} />
        <Route path="/admin/audit" element={<WithLayout><Audit /></WithLayout>} />
        <Route path="/admin/studies" element={<WithLayout><Studies /></WithLayout>} />
        <Route path="/admin/followups" element={<WithLayout><Followups /></WithLayout>} />
        <Route path="/admin/settings" element={<WithLayout><Settings /></WithLayout>} />

        {/* Doctor routes */}
        <Route path="/doctor" element={<WithLayout><DoctorDashboard /></WithLayout>} />
        <Route path="/doctor/consultation" element={<WithLayout><Consultation /></WithLayout>} />
        <Route path="/doctor/prescription" element={<WithLayout><Prescription /></WithLayout>} />

        {/* Receptionist routes */}
        <Route path="/receptionist" element={<WithLayout><ReceptionistDashboard /></WithLayout>} />

        {/* Patient routes – dedicated read-only portal */}
        <Route path="/patient" element={<WithLayout><PatientPortal /></WithLayout>} />
        <Route path="/patient/appointments" element={<WithLayout><PatientAppointments /></WithLayout>} />
        <Route path="/patient/book" element={<WithLayout><PatientBookAppointment /></WithLayout>} />
        <Route path="/patient/prescriptions" element={<WithLayout><PatientPrescriptions /></WithLayout>} />
        <Route path="/patient/studies" element={<WithLayout><PatientStudies /></WithLayout>} />
        <Route path="/patient/followups" element={<WithLayout><PatientFollowups /></WithLayout>} />
        <Route path="/patient/profile" element={<WithLayout><PatientProfile /></WithLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
