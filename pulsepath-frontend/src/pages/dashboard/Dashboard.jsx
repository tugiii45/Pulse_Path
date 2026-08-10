import { useEffect, useState } from "react";

import { getProfile } from "../../services/profileService";

import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();

      console.log("DASHBOARD PROFILE:", response);

      setProfile(response.data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

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