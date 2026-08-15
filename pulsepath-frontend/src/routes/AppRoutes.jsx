import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import LandingPage from "../pages/LandingPage";
import ProtectedRoute from "../components/routes/ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";

import Appointments from "../pages/appointments/Appointments";
import Visits from "../pages/Visits/Visits";
import Patients from "../pages/patients/Patients";
import Doctors from "../pages/doctors/Doctors";

import Clinical from "../pages/clinical/Clinical";
import MedicalRecords from "../pages/clinical/MedicalRecords";
import Diagnosis from "../pages/clinical/Diagnosis";

import Treatment from "../pages/treatment/Treatment";
import Medication from "../pages/treatment/Medication";
import Medications from "../pages/treatment/Medications";
import Prescriptions from "../pages/treatment/Prescriptions";
import RecoveryProgress from "../pages/treatment/RecoveryProgress";
import SideEffect from "../pages/treatment/SideEffect";

import Notifications from "../pages/notifications/Notifications";
import Hospitals from "../pages/hospitals/Hospitals";
import Departments from "../pages/departments/Departments";
import Profile from "../pages/profile/Profile";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Redirect old clinical diagnosis URL */}
        <Route
          path="/clinical/diagnosis"
          element={
            <Navigate
              to="/dashboard/clinical/diagnosis"
              replace
            />
          }
        />

        {/* =========================
            PROTECTED ROUTES
        ========================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<DashboardLayout />}
          >

            {/* Dashboard */}
            <Route
              index
              element={<Dashboard />}
            />

            {/* =========================
                GENERAL ROUTES
            ========================== */}

            <Route
              path="appointments"
              element={<Appointments />}
            />

            <Route
              path="visits"
              element={<Visits />}
            />

            {/* =========================
                ADMIN + DOCTOR
            ========================== */}

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

            {/* =========================
                ADMIN ONLY
            ========================== */}

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

            {/* =========================
                CLINICAL + TREATMENT
                ADMIN + DOCTOR
            ========================== */}

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

              {/* Medication shortcut */}

              <Route
                path="medication"
                element={<Medication />}
              />

              {/* Recovery Progress */}

              <Route
                path="treatment/recovery-progress"
                element={<RecoveryProgress />}
              />

              {/* Side Effects */}

              <Route
                path="treatment/side-effects"
                element={<SideEffect />}
              />

            </Route>

            {/* =========================
                GENERAL USER ROUTES
            ========================== */}

            <Route
              path="notifications"
              element={<Notifications />}
            />

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