import { useAuth } from "../../contexts/AuthContext";

import SuperAdminDashboard from "./Superadmindashboard";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";

function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    // Wait for AuthContext before making a role decision.
    return <p>Loading dashboard...</p>;
  }

  if (!profile) {
    // The protected route normally handles this, but keep the page defensive.
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
      // Regular administrators manage one hospital's operations.
      return <AdminDashboard />;

    case "DOCTOR":
      // Doctors work with assigned patients, visits, and clinical records.
      return <DoctorDashboard />;

    case "PATIENT":
      // Patients see their own appointments, treatment, and recovery data.
      return <PatientDashboard />;

    default:
      return <p>Unknown user role.</p>;
  }
}

export default Dashboard;