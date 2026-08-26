import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ================================
// Authentication & Public Pages
// ================================
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import LandingPage from "../pages/LandingPage";
import ProtectedRoute from "../components/routes/ProtectedRoute";

// ================================
// Dashboard Layout
// ================================
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";

// ================================
// General Modules
// ================================
import Appointments from "../pages/appointments/Appointments";
import Visits from "../pages/Visits/Visits";
import Notifications from "../pages/notifications/Notifications";
import Profile from "../pages/profile/Profile";

// ================================
// Administration
// ================================
import Patients from "../pages/patients/Patients";
import Doctors from "../pages/doctors/Doctors";
import Hospitals from "../pages/hospitals/Hospitals";
import RegisterMyHospital from "../pages/hospitals/Registermyhospital";
import Departments from "../pages/departments/Departments";
import SetPassword from "../pages/auth/SetPassword";

// ================================
// Clinical
// ================================
import Clinical from "../pages/clinical/Clinical";
import MedicalRecords from "../pages/clinical/MedicalRecords";
import Diagnosis from "../pages/clinical/Diagnosis";

// ================================
// Treatment Management
// ================================
import Treatment from "../pages/treatment/Treatment";
import Medication from "../pages/treatment/Medication";
import Prescriptions from "../pages/treatment/Prescriptions";

// ================================
// Patient Recovery
// ================================
import MedicationSchedule from "../pages/treatment/MedicationSchedule";
import MedicationLog from "../pages/treatment/MedicationLog";
import RecoveryProgress from "../pages/treatment/RecoveryProgress";
import SideEffect from "../pages/treatment/SideEffect";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================
            PUBLIC ROUTES
        ================================= */}

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/set-password/:uidb64/:token" element={<SetPassword />} />

        {/* Redirect old clinical diagnosis URL */}
        <Route
          path="/clinical/diagnosis"
          element={<Navigate to="/dashboard/clinical/diagnosis" replace />}
        />

        {/* ================================
            PROTECTED ROUTES
        ================================= */}

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* ================================
                DASHBOARD
            ================================= */}

            <Route index element={<Dashboard />} />

            {/* ================================
                ADMIN SELF-SERVICE ONBOARDING
                Reachable by any authenticated ADMIN, hospital or not.
                ProtectedRoute redirects an admin with no hospital here
                automatically; this route itself must stay open to
                ADMINs regardless of hospital status, or the redirect
                would loop.
            ================================= */}

            <Route
              path="register-hospital"
              element={<RegisterMyHospital />}
            />

            {/* ================================
                GENERAL USER ROUTES
                ADMIN + DOCTOR + PATIENT
            ================================= */}

            <Route path="appointments" element={<Appointments />} />

            <Route path="visits" element={<Visits />} />

            <Route path="notifications" element={<Notifications />} />

            <Route path="profile" element={<Profile />} />

            {/* ================================
                ADMIN + DOCTOR
            ================================= */}

            <Route
              element={<ProtectedRoute allowedRoles={["ADMIN", "DOCTOR"]} />}
            >
              {/* Patients */}
              <Route path="patients" element={<Patients />} />

              {/* Clinical */}
              <Route path="clinical" element={<Clinical />} />

              <Route
                path="clinical/medical-records"
                element={<MedicalRecords />}
              />

              <Route path="clinical/diagnosis" element={<Diagnosis />} />

              {/* Treatment Management */}
              <Route path="treatment" element={<Treatment />} />

              <Route path="treatment/medication" element={<Medication />} />

              <Route
                path="treatment/prescriptions"
                element={<Prescriptions />}
              />
            </Route>

            {/* ================================
                ADMIN ONLY
            ================================= */}

            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="doctors" element={<Doctors />} />

              <Route path="departments" element={<Departments />} />
            </Route>

            {/* Platform-wide hospital management: superadmin only.
                Regular ADMINs manage their own hospital via
                register-hospital above, not this page. */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]} requireSuperuser />
              }
            >
              <Route path="hospitals" element={<Hospitals />} />
            </Route>

            {/* ================================
                PATIENT RECOVERY
                PATIENT + DOCTOR + ADMIN
            ================================= */}

            <Route
              element={
                <ProtectedRoute allowedRoles={["PATIENT", "DOCTOR", "ADMIN"]} />
              }
            >
              {/* Medication Schedule */}
              <Route
                path="treatment/medication-schedule"
                element={<MedicationSchedule />}
              />

              {/* Medication Log */}
              <Route
                path="treatment/medication-log"
                element={<MedicationLog />}
              />

              {/* Side Effect Reporting */}
              <Route path="treatment/side-effects" element={<SideEffect />} />

              {/* Recovery Progress */}
              <Route
                path="treatment/recovery-progress"
                element={<RecoveryProgress />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;