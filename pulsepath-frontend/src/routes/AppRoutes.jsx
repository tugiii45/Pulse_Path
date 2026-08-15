import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import LandingPage from "../pages/LandingPage";
import ProtectedRoute from "../components/routes/ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Medication from "../pages/treatment/Medication";
import Medications from "../pages/treatment/Medications";
import Appointments from "../pages/appointments/Appointments";
import Visits from "../pages/Visits/Visits";
import Patients from "../pages/patients/Patients";
import Doctors from "../pages/doctors/Doctors";
import Prescriptions from "../pages/treatment/Prescriptions";
import Clinical from "../pages/clinical/Clinical";
import MedicalRecords from "../pages/clinical/MedicalRecords";
import Diagnosis from "../pages/clinical/Diagnosis";
import Treatment from "../pages/treatment/Treatment";
import Notifications from "../pages/notifications/Notifications";
import Hospitals from "../pages/hospitals/Hospitals";
import Departments from "../pages/departments/Departments";
import Profile from "../pages/profile/Profile";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/clinical/diagnosis"
          element={<Navigate to="/dashboard/clinical/diagnosis" replace />}
        />

        {/* Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />

            <Route path="appointments" element={<Appointments />} />
            <Route path="visits" element={<Visits />} />

            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "DOCTOR"]} />}>
              <Route path="patients" element={<Patients />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="doctors" element={<Doctors />} />
              <Route path="hospitals" element={<Hospitals />} />
              <Route path="departments" element={<Departments />} />
            </Route>

            {/* Clinical */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "DOCTOR"]} />}>
              <Route path="clinical" element={<Clinical />} />
              <Route path="clinical/medical-records" element={<MedicalRecords />} />
              <Route path="clinical/diagnosis" element={<Diagnosis />} />
              <Route path="treatment" element={<Treatment />} />
              <Route path="treatment/prescriptions" element={<Prescriptions />} />
              <Route path="treatment/medication" element={<Medication />} />
              <Route path="treatment/medications" element={<Medications />} />
              <Route path="medication" element={<Medication />} />
            </Route>

            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
