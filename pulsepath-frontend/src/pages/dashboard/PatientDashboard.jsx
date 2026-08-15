import { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaStethoscope,
  FaNotesMedical,
  FaPills,
  FaBell,
  FaHeartbeat,
} from "react-icons/fa";

import { getAppointments } from "../../services/AppointmentService";
import { getVisits } from "../../services/VisitService";
import { getDiagnoses } from "../../services/diagnosisService";
import { getMedications } from "../../services/Treatment/medicationService";
import { getNotifications } from "../../services/notificationService";

function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [medications, setMedications] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
        visitsResponse,
        diagnosesResponse,
        notificationsResponse,
      ] = await Promise.all([
        getAppointments(),
        getVisits(),
        getDiagnoses(),
        getNotifications(),
      ]);

      setAppointments(normalizeList(appointmentsResponse));
      setVisits(normalizeList(visitsResponse));
      setDiagnoses(normalizeList(diagnosesResponse));
      setNotifications(normalizeList(notificationsResponse));
    } catch (err) {
      console.error("PATIENT DASHBOARD ERROR:", err);
      setError("Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Upcoming appointment
  // --------------------------------
  const upcomingAppointments = appointments
    .filter((appointment) => {
      const appointmentDate =
        appointment.appointment_date ||
        appointment.date ||
        appointment.scheduled_date;

      if (!appointmentDate) return false;

      return new Date(appointmentDate) >= new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(a.appointment_date || a.date || a.scheduled_date);

      const dateB = new Date(b.appointment_date || b.date || b.scheduled_date);

      return dateA - dateB;
    });

  const nextAppointment = upcomingAppointments[0];

  // --------------------------------
  // Recent visits
  // --------------------------------
  const recentVisits = [...visits]
    .sort((a, b) => {
      const dateA = new Date(a.visit_date || a.created_at || 0);
      const dateB = new Date(b.visit_date || b.created_at || 0);

      return dateB - dateA;
    })
    .slice(0, 5);

  // --------------------------------
  // Latest diagnoses
  // --------------------------------
  const recentDiagnoses = [...diagnoses]
    .sort((a, b) => {
      const dateA = new Date(a.diagnosis_date || a.created_at || 0);

      const dateB = new Date(b.diagnosis_date || b.created_at || 0);

      return dateB - dateA;
    })
    .slice(0, 5);

  // --------------------------------
  // Notifications
  // --------------------------------
  const recentNotifications = [...notifications]
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);

      return dateB - dateA;
    })
    .slice(0, 5);

  // --------------------------------
  // Medication notifications
  // --------------------------------
  const medicationNotifications = notifications.filter((notification) => {
    const text = `
        ${notification.title || ""}
        ${notification.message || ""}
        ${notification.notification_type || ""}
        ${notification.type || ""}
      `.toLowerCase();

    return (
      text.includes("medication") ||
      text.includes("medicine") ||
      text.includes("dose") ||
      text.includes("pill")
    );
  });

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="mt-3">Loading your dashboard...</p>
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
        <h2 className="fw-bold">Patient Dashboard</h2>

        <p className="text-muted mb-0">
          Here's an overview of your healthcare journey.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        {/* Appointments */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Upcoming Appointments</p>

                  <h3 className="fw-bold mb-0">
                    {upcomingAppointments.length}
                  </h3>
                </div>

                <FaCalendarCheck size={30} />
              </div>
            </div>
          </div>
        </div>

        {/* Visits */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Visits</p>

                  <h3 className="fw-bold mb-0">{visits.length}</h3>
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
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Diagnoses</p>

                  <h3 className="fw-bold mb-0">{diagnoses.length}</h3>
                </div>

                <FaNotesMedical size={30} />
              </div>
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Medications</p>

                  <h3 className="fw-bold mb-0">{medications.length}</h3>
                </div>

                <FaPills size={30} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointment */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <FaCalendarCheck className="me-2" />
            Upcoming Appointment
          </h5>

          {!nextAppointment ? (
            <p className="text-muted mb-0">
              You don't have any upcoming appointments.
            </p>
          ) : (
            <div className="row">
              <div className="col-md-4">
                <p className="text-muted mb-1">Doctor</p>

                <h6>
                  {nextAppointment.doctor_name ||
                    nextAppointment.doctor?.name ||
                    "Doctor"}
                </h6>
              </div>

              <div className="col-md-4">
                <p className="text-muted mb-1">Date</p>

                <h6>
                  {nextAppointment.appointment_date
                    ? new Date(
                        nextAppointment.appointment_date,
                      ).toLocaleString()
                    : "Date unavailable"}
                </h6>
              </div>

              <div className="col-md-4">
                <p className="text-muted mb-1">Status</p>

                <span className="badge bg-primary">
                  {nextAppointment.status || "Scheduled"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row g-4">
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
                  <div key={visit.id} className="border-bottom py-2">
                    <strong>
                      {visit.doctor_name || visit.doctor?.name || "Doctor"}
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

        {/* Latest Diagnoses */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaNotesMedical className="me-2" />
                Latest Diagnoses
              </h5>

              {recentDiagnoses.length === 0 ? (
                <p className="text-muted">No diagnoses available.</p>
              ) : (
                recentDiagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="border-bottom py-2">
                    <strong>
                      {diagnosis.condition || diagnosis.name || "Diagnosis"}
                    </strong>

                    <div className="small text-muted">
                      {diagnosis.severity
                        ? `Severity: ${diagnosis.severity}`
                        : "Diagnosis recorded"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Current Medications */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaPills className="me-2" />
                Current Medications
              </h5>

              {medications.length === 0 ? (
                <p className="text-muted">No medications available.</p>
              ) : (
                medications.slice(0, 5).map((medication) => (
                  <div key={medication.id} className="border-bottom py-2">
                    <strong>
                      {medication.name ||
                        medication.medication_name ||
                        "Medication"}
                    </strong>

                    <div className="small text-muted">
                      {medication.description ||
                        medication.dosage ||
                        "Medication prescribed"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Medication Reminders */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaBell className="me-2" />
                Medication Reminders
              </h5>

              {medicationNotifications.length === 0 ? (
                <p className="text-muted">No medication reminders.</p>
              ) : (
                medicationNotifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="border-bottom py-2">
                    <strong>
                      {notification.title || "Medication Reminder"}
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

        {/* Recovery Progress */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaHeartbeat className="me-2" />
                Recovery Progress
              </h5>

              <div className="text-center py-3">
                <FaHeartbeat size={40} className="mb-3" />

                <p className="text-muted mb-0">
                  Recovery tracking will appear here once recovery progress has
                  been recorded.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <FaBell className="me-2" />
                Recent Notifications
              </h5>

              {recentNotifications.length === 0 ? (
                <p className="text-muted">No notifications.</p>
              ) : (
                recentNotifications.map((notification) => (
                  <div key={notification.id} className="border-bottom py-2">
                    <strong>{notification.title || "Notification"}</strong>

                    <div className="small text-muted">
                      {notification.message || ""}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
