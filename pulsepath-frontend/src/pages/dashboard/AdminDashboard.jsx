import { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserMd,
  FaCalendarCheck,
  FaHospital,
  FaBuilding,
  FaArrowRight,
} from "react-icons/fa";

import { getAdminDashboardData } from "../../services/adminDashboardService";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getAdminDashboardData();

      console.log("ADMIN DASHBOARD DATA:", data);

      setDashboardData(data);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="alert alert-danger">
        Failed to load dashboard data.
      </div>
    );
  }

  const patients = dashboardData.patients.results || [];
  const doctors = dashboardData.doctors.results || [];
  const appointments =
    dashboardData.appointments.results || [];
  const hospitals = dashboardData.hospitals.results || [];
  const departments =
    dashboardData.departments.results || [];

  const stats = [
    {
      title: "Patients",
      value: dashboardData.patients.count,
      icon: <FaUsers size={24} />,
      link: "/dashboard/patients",
    },
    {
      title: "Doctors",
      value: dashboardData.doctors.count,
      icon: <FaUserMd size={24} />,
      link: "/dashboard/doctors",
    },
    {
      title: "Appointments",
      value: dashboardData.appointments.count,
      icon: <FaCalendarCheck size={24} />,
      link: "/dashboard/appointments",
    },
    {
      title: "Hospitals",
      value: dashboardData.hospitals.count,
      icon: <FaHospital size={24} />,
      link: "/dashboard/hospitals",
    },
    {
      title: "Departments",
      value: dashboardData.departments.count,
      icon: <FaBuilding size={24} />,
      link: "/dashboard/departments",
    },
  ];

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Admin Dashboard
        </h2>

        <p className="text-muted mb-0">
          Welcome back. Here's an overview of your
          PulsePath system.
        </p>
      </div>

      {/* Statistics */}
      <div className="row g-4 mb-4">

        {stats.map((stat) => (
          <div
            className="col-12 col-sm-6 col-lg"
            key={stat.title}
          >
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">

                <div className="d-flex justify-content-between align-items-start">

                  <div>
                    <p className="text-muted mb-2">
                      {stat.title}
                    </p>

                    <h3 className="fw-bold mb-0">
                      {stat.value}
                    </h3>
                  </div>

                  <div className="text-primary">
                    {stat.icon}
                  </div>

                </div>

              </div>
            </div>
          </div>
        ))}

      </div>

      {/* Recent Appointments */}
      <div className="row g-4">

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>
                  <h5 className="fw-bold mb-1">
                    Recent Appointments
                  </h5>

                  <p className="text-muted small mb-0">
                    Latest appointments in the system
                  </p>
                </div>

                <a
                  href="/dashboard/appointments"
                  className="btn btn-sm btn-outline-primary"
                >
                  View All
                  <FaArrowRight className="ms-2" />
                </a>

              </div>

              {appointments.length === 0 ? (
                <p className="text-muted">
                  No appointments found.
                </p>
              ) : (
                <div className="table-responsive">

                  <table className="table align-middle">

                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>

                      {appointments
                        .slice(0, 5)
                        .map((appointment) => (
                          <tr key={appointment.id}>

                            <td>
                              {appointment.patient_name ||
                                "—"}
                            </td>

                            <td>
                              {appointment.doctor_name ||
                                "—"}
                            </td>

                            <td>
                              {appointment.appointment_date
                                ? new Date(
                                    appointment.appointment_date
                                  ).toLocaleDateString()
                                : "—"}
                            </td>

                            <td>
                              <span className="badge bg-light text-dark">
                                {appointment.status ||
                                  "—"}
                              </span>
                            </td>

                          </tr>
                        ))}

                    </tbody>

                  </table>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* System Overview */}
        <div className="col-lg-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h5 className="fw-bold mb-4">
                System Overview
              </h5>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    Patients
                  </span>
                  <strong>
                    {patients.length}
                  </strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        patients.length * 10,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    Doctors
                  </span>
                  <strong>
                    {doctors.length}
                  </strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        doctors.length * 10,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    Hospitals
                  </span>
                  <strong>
                    {hospitals.length}
                  </strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        hospitals.length * 20,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    Departments
                  </span>
                  <strong>
                    {departments.length}
                  </strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        departments.length * 10,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;