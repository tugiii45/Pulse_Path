import { useAuth } from "../../contexts/AuthContext";

import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";

function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (!profile) {
    return <p>Unable to load profile.</p>;
  }

  // Superadmins are CustomUser records with role="ADMIN" (see
  // CustomUserManager.create_superuser), so is_superuser must be
  // checked before falling into the role switch below -- otherwise
  // a superadmin would be routed into the regular AdminDashboard.
  if (profile.is_superuser) {
    return <SuperAdminDashboard />;
  }

  switch (profile.role) {
    case "ADMIN":
      return <AdminDashboard />;

    case "DOCTOR":
      return <DoctorDashboard />;

    case "PATIENT":
      return <PatientDashboard />;

    default:
      return <p>Unknown user role.</p>;
  }
}

export default Dashboard;