import { useEffect, useState } from "react";
import { FaCalendarCheck, FaUserInjured, FaNotesMedical } from "react-icons/fa";
import { FaClock, FaStethoscope, FaPills, FaBell } from "react-icons/fa6";

import { getAppointments } from "../../services/AppointmentService";
import { getPatients } from "../../services/PatientService";
import { getVisits } from "../../services/VisitService";
import { getDiagnoses } from "../../services/diagnosisService";
import { getNotifications } from "../../services/notificationService";
import { getClinicalRecords } from "../../services/ClinicalService";

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clinicalRecords, setClinicalRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const normalizeList = (response) => {
    const payload = response?.data ?? response;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload?.results && Array.isArray(payload.results)) {
      return payload.results;
    }

    if (payload?.data && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (payload?.data?.results && Array.isArray(payload.data.results)) {
      return payload.data.results;
    }

    return [];
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        appointmentsResponse,
        patientsResponse,
        visitsResponse,
        diagnosesResponse,
        notificationsResponse,
        clinicalResponse,
      ] = await Promise.all([
        getAppointments(),
        getPatients(),
        getVisits(),
        getDiagnoses(),
        getNotifications(),
        getClinicalRecords(),
      ]);

      setAppointments(normalizeList(appointmentsResponse));
      setPatients(normalizeList(patientsResponse));
      setVisits(normalizeList(visitsResponse));
      setDiagnoses(normalizeList(diagnosesResponse));
      setNotifications(normalizeList(notificationsResponse));
      setClinicalRecords(normalizeList(clinicalResponse));
    } catch (err) {
      console.error("DOCTOR DASHBOARD ERROR:", err);
      setError("Unable to load dashboard information.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Today's appointments
  // --------------------------------
  const today = new Date();

  const todaysAppointments = appointments.filter((appointment) => {
    const appointmentDate =
      appointment.appointment_date ||
      appointment.date ||
      appointment.scheduled_date;

    if (!appointmentDate) return false;

    const date = new Date(appointmentDate);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  });

  // --------------------------------
  // Recent visits
  // --------------------------------
  const recentVisits = [...visits]
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.visit_date || 0);
      const dateB = new Date(b.created_at || b.visit_date || 0);

      return dateB - dateA;
    })
    .slice(0, 5);

  // --------------------------------
  // Recent diagnoses
  // --------------------------------
  const recentDiagnoses = [...diagnoses]
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.diagnosis_date || 0);
      const dateB = new Date(b.created_at || b.diagnosis_date || 0);

      return dateB - dateA;
    })
    .slice(0, 5);

  // --------------------------------
  // Pending follow-ups
  // --------------------------------
  const pendingFollowUps = appointments.filter((appointment) => {
    const status = String(appointment.status || "").toLowerCase();

    return (
      status === "pending" ||
      status === "scheduled" ||
      status === "follow_up" ||
      status === "follow-up"
    );
  });

  // --------------------------------
  // Missed medication alerts
  // --------------------------------
  const missedMedicationAlerts = notifications.filter((notification) => {
    const type = String(
      notification.notification_type ||
        notification.type ||
        notification.title ||
        ""
    ).toLowerCase();

    return (
      type.includes("missed") ||
      type.includes("medication") ||
      type.includes("dose")
    );
  });

  // --------------------------------
  // Recovery updates
  // --------------------------------
  const recoveryUpdates = clinicalRecords
    .filter(
      (record) =>
        record.improvement_percentage !== undefined ||
        record.feeling_better !== undefined ||
        record.pain_level !== undefined
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="mt-3">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Doctor Dashboard</h2>
        <p className="text-muted mb-0">
          Overview of your patients, appointments and clinical activity.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">

        {/* Today's appointments */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1">Today's Appointments</p>
                  <h3 className="fw-bold">
                    {todaysAppointments.length}
                  </h3>
                </div>

                <FaCalendarCheck size={30} />
              </div>
            </div>
          </div>
        </div>

        {/* Patients */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1">Patients</p>
                  <h3 className="fw-bold">{patients.length}</h3>
                </div>

                <FaUserInjured size={30} />
              </div>
            </div>
          </div>
        </div>

        {/* Visits */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1">Recent Visits</p>
                  <h3 className="fw-bold">{visits.length}</h3>
                </div>

                <FaStethoscope size={30} />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnoses */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1">Diagnoses</p>
                  <h3 className="fw-bold">{diagnoses.length}</h3>
                </div>

                <FaNotesMedical size={30} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <FaCalendarCheck className="me-2" />
            Today's Appointments
          </h5>

          {todaysAppointments.length === 0 ? (
            <p className="text-muted mb-0">
              No appointments scheduled for today.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {todaysAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        {appointment.patient_name ||
                          appointment.patient?.name ||
                          appointment.patient ||
                          "Patient"}
                      </td>

                      <td>
                        {appointment.appointment_date
                          ? new Date(
                              appointment.appointment_date
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>

                      <td>
                        <span className="badge bg-primary">
                          {appointment.status || "Scheduled"}
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

      <div className="row g-4">

        {/* Assigned Patients */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaUserInjured className="me-2" />
                Assigned Patients
              </h5>

              {patients.length === 0 ? (
                <p className="text-muted">No patients found.</p>
              ) : (
                patients.slice(0, 5).map((patient) => (
                  <div
                    key={patient.id}
                    className="d-flex justify-content-between border-bottom py-2"
                  >
                    <span>
                      {patient.name ||
                        patient.full_name ||
                        `${patient.first_name || ""} ${
                          patient.last_name || ""
                        }`}
                    </span>

                    <span className="text-muted">
                      {patient.email || ""}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaClock className="me-2" />
                Pending Follow-ups
              </h5>

              {pendingFollowUps.length === 0 ? (
                <p className="text-muted">
                  No pending follow-ups.
                </p>
              ) : (
                pendingFollowUps.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border-bottom py-2"
                  >
                    <strong>
                      {appointment.patient_name ||
                        appointment.patient?.name ||
                        "Patient"}
                    </strong>

                    <div className="small text-muted">
                      {appointment.appointment_date
                        ? new Date(
                            appointment.appointment_date
                          ).toLocaleDateString()
                        : "Date unavailable"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Visits */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaStethoscope className="me-2" />
                Recent Visits
              </h5>

              {recentVisits.length === 0 ? (
                <p className="text-muted">No recent visits.</p>
              ) : (
                recentVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="border-bottom py-2"
                  >
                    <strong>
                      {visit.patient_name ||
                        visit.patient?.name ||
                        "Patient"}
                    </strong>

                    <div className="small text-muted">
                      {visit.visit_date ||
                        visit.created_at ||
                        "Date unavailable"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Diagnoses */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaNotesMedical className="me-2" />
                Recent Diagnoses
              </h5>

              {recentDiagnoses.length === 0 ? (
                <p className="text-muted">
                  No recent diagnoses.
                </p>
              ) : (
                recentDiagnoses.map((diagnosis) => (
                  <div
                    key={diagnosis.id}
                    className="border-bottom py-2"
                  >
                    <strong>
                      {diagnosis.condition ||
                        diagnosis.name ||
                        "Diagnosis"}
                    </strong>

                    <div className="small text-muted">
                      Patient:{" "}
                      {diagnosis.patient_name ||
                        diagnosis.patient?.name ||
                        "Patient"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recovery Updates */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                📈 Patient Recovery Updates
              </h5>

              {recoveryUpdates.length === 0 ? (
                <p className="text-muted">
                  No recovery updates available.
                </p>
              ) : (
                recoveryUpdates.map((record) => (
                  <div
                    key={record.id}
                    className="border-bottom py-2"
                  >
                    <strong>
                      {record.patient_name ||
                        record.patient?.name ||
                        "Patient"}
                    </strong>

                    {record.improvement_percentage !== undefined && (
                      <div className="small">
                        Improvement:{" "}
                        <strong>
                          {record.improvement_percentage}%
                        </strong>
                      </div>
                    )}

                    {record.pain_level !== undefined && (
                      <div className="small text-muted">
                        Pain level: {record.pain_level}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Missed Medication */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaPills className="me-2" />
                Missed Medication Alerts
              </h5>

              {missedMedicationAlerts.length === 0 ? (
                <p className="text-muted">
                  No missed medication alerts.
                </p>
              ) : (
                missedMedicationAlerts.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="border-bottom py-2"
                  >
                    <strong>
                      {notification.title || "Medication Alert"}
                    </strong>

                    <div className="small text-muted">
                      {notification.message ||
                        "A patient may have missed a medication dose."}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Notifications */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <FaBell className="me-2" />
            Recent Notifications
          </h5>

          {notifications.length === 0 ? (
            <p className="text-muted mb-0">
              No notifications.
            </p>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className="border-bottom py-2"
              >
                <strong>
                  {notification.title || "Notification"}
                </strong>

                <div className="small text-muted">
                  {notification.message || ""}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;