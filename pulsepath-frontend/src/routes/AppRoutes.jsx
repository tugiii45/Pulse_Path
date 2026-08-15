import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import LandingPage from "../pages/LandingPage";
import ProtectedRoute from "../components/routes/ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";

import Medication from "../pages/treatment/Medication";
import Medications from "../pages/treatment/Medications";
import MedicationSchedule from "../pages/treatment/MedicationSchedule";
import MedicationLog from "../pages/treatment/MedicationLog";

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
          element={
            <Navigate
              to="/dashboard/clinical/diagnosis"
              replace
            />
          }
        />

        {/* Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>

            <Route index element={<Dashboard />} />

            {/* Appointments & Visits */}
            <Route
              path="appointments"
              element={<Appointments />}
            />

            <Route
              path="visits"
              element={<Visits />}
            />

            {/* Patients */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCTOR"]}
                />
              }
            >
              <Route
                path="patients"
                element={<Patients />}
              />
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN"]}
                />
              }
            >
              <Route
                path="doctors"
                element={<Doctors />}
              />

              <Route
                path="hospitals"
                element={<Hospitals />}
              />

              <Route
                path="departments"
                element={<Departments />}
              />
            </Route>

            {/* Clinical & Treatment */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCTOR"]}
                />
              }
            >
              {/* Clinical */}
              <Route
                path="clinical"
                element={<Clinical />}
              />

              <Route
                path="clinical/medical-records"
                element={<MedicalRecords />}
              />

              <Route
                path="clinical/diagnosis"
                element={<Diagnosis />}
              />

              {/* Treatment */}
              <Route
                path="treatment"
                element={<Treatment />}
              />

              <Route
                path="treatment/prescriptions"
                element={<Prescriptions />}
              />

              {/* Medications */}
              <Route
                path="treatment/medication"
                element={<Medication />}
              />

              <Route
                path="treatment/medications"
                element={<Medications />}
              />

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

              {/* Existing medication route */}
              <Route
                path="medication"
                element={<Medication />}
              />
            </Route>

            {/* Notifications */}
            <Route
              path="notifications"
              element={<Notifications />}
            />

            {/* Profile */}
            <Route
              path="profile"
              element={<Profile />}
            />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;