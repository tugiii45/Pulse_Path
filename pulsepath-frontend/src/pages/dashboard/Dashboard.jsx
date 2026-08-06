import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/dashboardService";

function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    notifications: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="fw-bold">Welcome Back 👋</h2>
        <p className="text-muted">
          Here's an overview of your PulsePath healthcare system.
        </p>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-4">

            <div className="col-md-3">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center">
                  <h6 className="text-muted">👨‍⚕️ Doctors</h6>
                  <h2>{stats.doctors}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center">
                  <h6 className="text-muted">🧑‍🤝‍🧑 Patients</h6>
                  <h2>{stats.patients}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center">
                  <h6 className="text-muted">📅 Appointments</h6>
                  <h2>{stats.appointments}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center">
                  <h6 className="text-muted">🔔 Notifications</h6>
                  <h2>{stats.notifications}</h2>
                </div>
              </div>
            </div>

          </div>

          <div className="card shadow-sm border-0 mt-5">
            <div className="card-body">
              <h4 className="mb-3">Recent Activity</h4>

              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  ✅ Dashboard connected successfully.
                </li>
                <li className="list-group-item">
                  📊 Live statistics loaded from the backend.
                </li>
                <li className="list-group-item">
                  💊 PulsePath is ready for the next module.
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;