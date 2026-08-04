import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Appointments from "../pages/appointments/Appointments";
import Patients from "../pages/patients/Patients";
import Doctors from "../pages/doctors/Doctors";
import Clinical from "../pages/clinical/Clinical";
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Layout */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="patients" element={<Patients />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="clinical" element={<Clinical />} />
          <Route path="treatment" element={<Treatment />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="hospitals" element={<Hospitals />} />
          <Route path="departments" element={<Departments />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;