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

  // ---------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------

  if (!dashboardData) {
    return (
      <div className="alert alert-danger">
        Failed to load dashboard data.
      </div>
    );
  }

  // ---------------------------------------------------------
  // NORMALIZED DATA
  // ---------------------------------------------------------

  const patients = dashboardData.patients?.results || [];
  const doctors = dashboardData.doctors?.results || [];
  const appointments =
    dashboardData.appointments?.results || [];
  const hospitals = dashboardData.hospitals?.results || [];
  const departments =
    dashboardData.departments?.results || [];

  // ---------------------------------------------------------
  // DASHBOARD STATISTICS
  // ---------------------------------------------------------

  const stats = [
    {
      title: "Patients",
      value: dashboardData.patients?.count || 0,
      icon: <FaUsers size={24} />,
      link: "/dashboard/patients",
    },
    {
      title: "Doctors",
      value: dashboardData.doctors?.count || 0,
      icon: <FaUserMd size={24} />,
      link: "/dashboard/doctors",
    },
    {
      title: "Appointments",
      value: dashboardData.appointments?.count || 0,
      icon: <FaCalendarCheck size={24} />,
      link: "/dashboard/appointments",
    },
    {
      title: "Hospitals",
      value: dashboardData.hospitals?.count || 0,
      icon: <FaHospital size={24} />,
      link: "/dashboard/hospitals",
    },
    {
      title: "Departments",
      value: dashboardData.departments?.count || 0,
      icon: <FaBuilding size={24} />,
      link: "/dashboard/departments",
    },
  ];

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div className="container-fluid py-3">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Admin Dashboard
        </h2>

        <p className="text-muted mb-0">
          Welcome back. Here's an overview of your
          PulsePath system.
        </p>
      </div>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

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

      {/* =====================================================
          RECENT APPOINTMENTS + SYSTEM OVERVIEW
      ====================================================== */}

      <div className="row g-4">

        {/* ===================================================
            RECENT APPOINTMENTS
        ==================================================== */}

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm h-100">

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
                <p className="text-muted mb-0">
                  No appointments found.
                </p>
              ) : (
                <div className="table-responsive">

                  <table className="table align-middle mb-0">

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

                            <td className="fw-semibold">
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
                                  "PENDING"}
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

        {/* ===================================================
            SYSTEM OVERVIEW
        ==================================================== */}

        <div className="col-lg-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h5 className="fw-bold mb-4">
                System Overview
              </h5>

              {/* PATIENTS */}

              <div className="mb-4">

                <div className="d-flex justify-content-between mb-2">

                  <span className="text-muted">
                    Patients
                  </span>

                  <strong>
                    {dashboardData.patients?.count || 0}
                  </strong>

                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        (dashboardData.patients?.count || 0) * 10,
                        100
                      )}%`,
                    }}
                  />
                </div>

              </div>

              {/* DOCTORS */}

              <div className="mb-4">

                <div className="d-flex justify-content-between mb-2">

                  <span className="text-muted">
                    Doctors
                  </span>

                  <strong>
                    {dashboardData.doctors?.count || 0}
                  </strong>

                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        (dashboardData.doctors?.count || 0) * 10,
                        100
                      )}%`,
                    }}
                  />
                </div>

              </div>

              {/* HOSPITALS */}

              <div className="mb-4">

                <div className="d-flex justify-content-between mb-2">

                  <span className="text-muted">
                    Hospitals
                  </span>

                  <strong>
                    {dashboardData.hospitals?.count || 0}
                  </strong>

                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        (dashboardData.hospitals?.count || 0) * 20,
                        100
                      )}%`,
                    }}
                  />
                </div>

              </div>

              {/* DEPARTMENTS */}

              <div>

                <div className="d-flex justify-content-between mb-2">

                  <span className="text-muted">
                    Departments
                  </span>

                  <strong>
                    {dashboardData.departments?.count || 0}
                  </strong>

                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        (dashboardData.departments?.count || 0) * 10,
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