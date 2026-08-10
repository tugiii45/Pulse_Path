import { useAuth } from "../../contexts/AuthContext";

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
