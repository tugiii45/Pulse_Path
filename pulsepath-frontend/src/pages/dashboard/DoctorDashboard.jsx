import React, { useEffect, useMemo, useState } from "react";
import {
  FaCalendarCheck,
  FaUserInjured,
  FaClock,
  FaPills,
  FaBell,
  FaChartLine,
  FaArrowRight,
  FaTriangleExclamation,
} from "react-icons/fa6";

import { getProfile } from "../../services/profileService";
import { getAppointments } from "../../services/AppointmentService";
import { getPatients } from "../../services/PatientService";
import { getNotifications } from "../../services/notificationService";
import { getClinicalRecords } from "../../services/ClinicalService";

// =========================
// GREETING
// =========================

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";

  return "evening";
};

// =========================
// NORMALIZE LIST RESPONSE
// =========================

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

// =========================
// PATIENT NAME RESOLUTION
// =========================

const resolvePatientName = (record) => {
  return (
    record?.patient_name ||
    record?.patient?.name ||
    record?.patient?.full_name ||
    (typeof record?.patient === "string" ? record.patient : "") ||
    record?.name ||
    record?.full_name ||
    "Patient"
  );
};

// =========================
// DATE FORMATTING
// =========================

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// =========================
// SAME DAY
// =========================

const isSameDay = (dateA, dateB) => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

// =========================
// STATUS BADGE
// =========================

const getStatusClass = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("confirm") ||
    normalized.includes("complete") ||
    normalized.includes("approved")
  ) {
    return "bg-success-subtle text-success";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("scheduled")
  ) {
    return "bg-warning-subtle text-warning";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("reject")
  ) {
    return "bg-danger-subtle text-danger";
  }

  return "bg-primary-subtle text-primary";
};

// =========================
// DOCTOR DASHBOARD
// =========================

function DoctorDashboard() {
  // =========================
  // PROFILE
  // =========================

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // =========================
  // APPOINTMENTS
  // =========================

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentError, setAppointmentError] = useState("");

  // =========================
  // PATIENTS
  // =========================

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientError, setPatientError] = useState("");

  // =========================
  // NOTIFICATIONS / ALERTS
  // =========================

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  // =========================
  // RECOVERY
  // =========================

  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [loadingClinical, setLoadingClinical] = useState(true);
  const [clinicalError, setClinicalError] = useState("");

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        console.log("DOCTOR DASHBOARD PROFILE:", data);

        setProfile(data);
      } catch (error) {
        console.error("Unable to load doctor profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  // =========================
  // LOAD APPOINTMENTS
  // =========================

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoadingAppointments(true);
        setAppointmentError("");

        const response = await getAppointments();

        console.log("DOCTOR DASHBOARD APPOINTMENTS:", response);

        setAppointments(normalizeList(response));
      } catch (error) {
        console.error("Unable to load appointments:", error);

        setAppointmentError("Unable to load appointments.");
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, []);

  // =========================
  // LOAD PATIENTS
  // =========================

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        setPatientError("");

        const response = await getPatients();

        console.log("DOCTOR DASHBOARD PATIENTS:", response);

        setPatients(normalizeList(response));
      } catch (error) {
        console.error("Unable to load your patients:", error);

        setPatientError("Unable to load your patient list.");
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, []);

  // =========================
  // LOAD NOTIFICATIONS
  // =========================

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoadingNotifications(true);
        setNotificationError("");

        const response = await getNotifications();

        console.log("DOCTOR DASHBOARD NOTIFICATIONS:", response);

        setNotifications(normalizeList(response));
      } catch (error) {
        console.error("Unable to load notifications:", error);

        setNotificationError("Unable to load your alerts.");
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, []);

  // =========================
  // LOAD RECOVERY RECORDS
  // =========================

  useEffect(() => {
    const loadClinicalRecords = async () => {
      try {
        setLoadingClinical(true);
        setClinicalError("");

        const response = await getClinicalRecords();

        console.log(
          "DOCTOR DASHBOARD CLINICAL RECORDS:",
          response
        );

        setClinicalRecords(normalizeList(response));
      } catch (error) {
        console.error(
          "Unable to load recovery updates:",
          error
        );

        setClinicalError("Unable to load recovery updates.");
      } finally {
        setLoadingClinical(false);
      }
    };

    loadClinicalRecords();
  }, []);

  // =========================
  // DOCTOR NAME
  // =========================

  const doctorName =
    `Dr. ${profile?.first_name || ""} ${
      profile?.last_name || ""
    }`.trim() ||
    profile?.username ||
    "Doctor";

  // =========================
  // TODAY
  // =========================

  const today = new Date();

  // =========================
  // TODAY'S APPOINTMENTS
  // =========================

  const todaysAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const appointmentDate =
          appointment.appointment_date ||
          appointment.date ||
          appointment.scheduled_date;

        if (!appointmentDate) return false;

        const parsedDate = new Date(appointmentDate);

        if (Number.isNaN(parsedDate.getTime())) {
          return false;
        }

        return isSameDay(parsedDate, today);
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.appointment_date ||
            a.date ||
            a.scheduled_date
        );

        const dateB = new Date(
          b.appointment_date ||
            b.date ||
            b.scheduled_date
        );

        return dateA - dateB;
      });
  }, [appointments]);

  // =========================
  // PENDING FOLLOW-UPS
  // =========================

  const pendingFollowUps = useMemo(() => {
    return appointments.filter((appointment) => {
      const status = String(
        appointment.status || ""
      ).toLowerCase();

      return (
        status === "pending" ||
        status === "scheduled" ||
        status === "follow_up" ||
        status === "follow-up"
      );
    });
  }, [appointments]);

  // =========================
  // PATIENT ALERTS
  // =========================

  const patientAlerts = useMemo(() => {
    return notifications
      .filter((notification) => {
        const type = String(
          notification.notification_type ||
            notification.type ||
            notification.title ||
            ""
        ).toLowerCase();

        const title = String(
          notification.title || ""
        ).toLowerCase();

        return (
          type.includes("missed") ||
          type.includes("medication") ||
          type.includes("dose") ||
          type.includes("side_effect") ||
          type.includes("side-effect") ||
          type.includes("side effect") ||
          title.includes("missed") ||
          title.includes("medication") ||
          title.includes("side effect") ||
          title.includes("dose")
        );
      })
      .slice(0, 5);
  }, [notifications]);

  // =========================
  // RECENT NOTIFICATIONS
  // =========================

  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      )
      .slice(0, 5);
  }, [notifications]);

  // =========================
  // RECOVERY UPDATES
  // =========================

  const recoveryUpdates = useMemo(() => {
    return clinicalRecords
      .filter(
        (record) =>
          record.improvement_percentage !== undefined ||
          record.feeling_better !== undefined ||
          record.pain_level !== undefined
      )
      .sort(
        (a, b) =>
          new Date(
            b.recorded_at ||
              b.created_at ||
              0
          ) -
          new Date(
            a.recorded_at ||
              a.created_at ||
              0
          )
      )
      .slice(0, 5);
  }, [clinicalRecords]);

  // =========================
  // RECENT PATIENTS
  // =========================

  const recentPatients = useMemo(() => {
    return patients.slice(0, 5);
  }, [patients]);

  // =========================
  // UNREAD ALERT COUNT
  // =========================

  const unreadAlerts = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="container-fluid py-4">
      {/* =========================
          WELCOME
      ========================== */}

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          {loadingProfile
            ? "Welcome 👋"
            : `Good ${getGreeting()}, ${doctorName} 👋`}
        </h2>

        <p className="text-muted mb-0">
          Here's what's happening with your patients today.
        </p>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================== */}

      <div className="row g-4 mb-4">
        {/* Today's Appointments */}

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    Today's Appointments
                  </p>

                  <h3 className="fw-bold mb-0">
                    {loadingAppointments
                      ? "-"
                      : todaysAppointments.length}
                  </h3>
                </div>

                <div className="rounded-circle bg-primary-subtle p-3">
                  <FaCalendarCheck
                    className="text-primary"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patients */}

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    My Patients
                  </p>

                  <h3 className="fw-bold mb-0">
                    {loadingPatients
                      ? "-"
                      : patients.length}
                  </h3>
                </div>

                <div className="rounded-circle bg-success-subtle p-3">
                  <FaUserInjured
                    className="text-success"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-ups */}

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    Pending Follow-ups
                  </p>

                  <h3 className="fw-bold mb-0">
                    {loadingAppointments
                      ? "-"
                      : pendingFollowUps.length}
                  </h3>
                </div>

                <div className="rounded-circle bg-warning-subtle p-3">
                  <FaClock
                    className="text-warning"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    Unread Alerts
                  </p>

                  <h3 className="fw-bold mb-0">
                    {loadingNotifications
                      ? "-"
                      : unreadAlerts}
                  </h3>
                </div>

                <div className="rounded-circle bg-danger-subtle p-3">
                  <FaBell
                    className="text-danger"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          TODAY'S APPOINTMENTS
      ========================== */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaCalendarCheck className="text-primary" />

                <h5 className="fw-bold mb-0">
                  Today's Appointments
                </h5>
              </div>

              <p className="text-muted mb-0">
                Your scheduled appointments for today.
              </p>
            </div>

            {!loadingAppointments &&
              todaysAppointments.length > 0 && (
                <span className="badge bg-primary-subtle text-primary px-3 py-2">
                  {todaysAppointments.length} scheduled
                </span>
              )}
          </div>

          {loadingAppointments && (
            <div className="text-center py-5">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              />

              <p className="text-muted small mt-2 mb-0">
                Loading appointments...
              </p>
            </div>
          )}

          {!loadingAppointments &&
            appointmentError && (
              <div className="alert alert-danger small">
                {appointmentError}
              </div>
            )}

          {!loadingAppointments &&
            !appointmentError &&
            todaysAppointments.length === 0 && (
              <div className="text-center py-5">
                <FaCalendarCheck
                  className="text-muted mb-3"
                  size={34}
                />

                <p className="fw-semibold mb-1">
                  No appointments today
                </p>

                <p className="text-muted small mb-0">
                  You have no appointments scheduled
                  for today.
                </p>
              </div>
            )}

          {!loadingAppointments &&
            !appointmentError &&
            todaysAppointments.length > 0 && (
              <>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {todaysAppointments.map(
                        (appointment) => (
                          <tr key={appointment.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle bg-primary-subtle p-2">
                                  <FaUserInjured
                                    className="text-primary"
                                    size={12}
                                  />
                                </div>

                                <span className="fw-semibold">
                                  {resolvePatientName(
                                    appointment
                                  )}
                                </span>
                              </div>
                            </td>

                            <td>
                              {formatTime(
                                appointment.appointment_date ||
                                  appointment.date ||
                                  appointment.scheduled_date
                              )}
                            </td>

                            <td>
                              {appointment.reason ||
                                appointment.purpose ||
                                appointment.type ||
                                "Consultation"}
                            </td>

                            <td>
                              <span
                                className={`badge ${getStatusClass(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status ||
                                  "Scheduled"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <button className="btn btn-outline-primary w-100 mt-4">
                  View All Appointments
                  <FaArrowRight
                    className="ms-2"
                    size={12}
                  />
                </button>
              </>
            )}
        </div>
      </div>

      {/* =========================
          ALERTS + RECOVERY
      ========================== */}

      <div className="row g-4 mb-4">
        {/* =========================
            PATIENT ALERTS
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaTriangleExclamation className="text-danger" />

                    <h5 className="fw-bold mb-0">
                      Patient Alerts
                    </h5>
                  </div>

                  <p className="text-muted mb-0">
                    Medication, missed-dose and side-effect
                    alerts requiring attention.
                  </p>
                </div>

                {patientAlerts.length > 0 && (
                  <span className="badge bg-danger-subtle text-danger">
                    {patientAlerts.length}
                  </span>
                )}
              </div>

              {loadingNotifications && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-danger"
                    role="status"
                  />

                  <p className="text-muted small mt-2 mb-0">
                    Loading alerts...
                  </p>
                </div>
              )}

              {!loadingNotifications &&
                notificationError && (
                  <div className="alert alert-danger small">
                    {notificationError}
                  </div>
                )}

              {!loadingNotifications &&
                !notificationError &&
                patientAlerts.length === 0 && (
                  <div className="text-center py-4">
                    <FaPills
                      className="text-muted mb-3"
                      size={30}
                    />

                    <p className="fw-semibold mb-1">
                      No patient alerts
                    </p>

                    <p className="text-muted small mb-0">
                      There are currently no medication or
                      side-effect alerts requiring attention.
                    </p>
                  </div>
                )}

              {!loadingNotifications &&
                !notificationError &&
                patientAlerts.length > 0 && (
                  <>
                    {patientAlerts.map(
                      (notification) => (
                        <div
                          key={notification.id}
                          className="d-flex align-items-start gap-3 p-3 bg-danger-subtle rounded mb-2"
                        >
                          <FaPills
                            className="text-danger mt-1"
                            size={14}
                          />

                          <div className="flex-grow-1">
                            <div className="fw-semibold">
                              {notification.title ||
                                "Patient Alert"}
                            </div>

                            <small className="text-muted">
                              {notification.message ||
                                "A patient requires attention."}
                            </small>

                            {notification.created_at && (
                              <small className="text-muted d-block mt-1">
                                {formatDate(
                                  notification.created_at
                                )}
                              </small>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    <button className="btn btn-outline-danger w-100 mt-3">
                      View All Alerts
                      <FaArrowRight
                        className="ms-2"
                        size={12}
                      />
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* =========================
            RECOVERY UPDATES
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaChartLine className="text-info" />

                <h5 className="fw-bold mb-0">
                  Recovery Updates
                </h5>
              </div>

              <p className="text-muted mb-3">
                Recent progress reported by your patients.
              </p>

              {loadingClinical && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-info"
                    role="status"
                  />

                  <p className="text-muted small mt-2 mb-0">
                    Loading recovery updates...
                  </p>
                </div>
              )}

              {!loadingClinical &&
                clinicalError && (
                  <div className="alert alert-danger small">
                    {clinicalError}
                  </div>
                )}

              {!loadingClinical &&
                !clinicalError &&
                recoveryUpdates.length === 0 && (
                  <div className="text-center py-4">
                    <FaChartLine
                      className="text-muted mb-3"
                      size={30}
                    />

                    <p className="fw-semibold mb-1">
                      No recovery updates
                    </p>

                    <p className="text-muted small mb-0">
                      Patient progress reports will appear
                      here.
                    </p>
                  </div>
                )}

              {!loadingClinical &&
                !clinicalError &&
                recoveryUpdates.length > 0 && (
                  <>
                    {recoveryUpdates.map((record) => (
                      <div
                        key={record.id}
                        className="border-bottom py-3"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-semibold">
                              {resolvePatientName(record)}
                            </div>

                            <small className="text-muted">
                              {formatDate(
                                record.recorded_at ||
                                  record.created_at
                              )}
                            </small>
                          </div>

                          {record.improvement_percentage !==
                            undefined && (
                            <span className="badge bg-info-subtle text-info">
                              {
                                record.improvement_percentage
                              }
                              %
                            </span>
                          )}
                        </div>

                        <div className="mt-2">
                          {record.pain_level !== undefined && (
                            <small className="text-muted me-3">
                              Pain:{" "}
                              <strong>
                                {record.pain_level}/10
                              </strong>
                            </small>
                          )}

                          {record.feeling_better !==
                            undefined && (
                            <small className="text-muted">
                              Feeling better:{" "}
                              <strong>
                                {record.feeling_better
                                  ? "Yes"
                                  : "No"}
                              </strong>
                            </small>
                          )}
                        </div>
                      </div>
                    ))}

                    <button className="btn btn-outline-info w-100 mt-3">
                      View All Recovery Updates
                      <FaArrowRight
                        className="ms-2"
                        size={12}
                      />
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          RECENT PATIENTS
      ========================== */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaUserInjured className="text-success" />

                <h5 className="fw-bold mb-0">
                  Recent Patients
                </h5>
              </div>

              <p className="text-muted mb-0">
                Patients currently within your clinical scope.
              </p>
            </div>

            {!loadingPatients &&
              patients.length > 0 && (
                <span className="badge bg-success-subtle text-success">
                  {patients.length} total
                </span>
              )}
          </div>

          {loadingPatients && (
            <div className="text-center py-4">
              <div
                className="spinner-border spinner-border-sm text-success"
                role="status"
              />

              <p className="text-muted small mt-2 mb-0">
                Loading patients...
              </p>
            </div>
          )}

          {!loadingPatients && patientError && (
            <div className="alert alert-danger small">
              {patientError}
            </div>
          )}

          {!loadingPatients &&
            !patientError &&
            recentPatients.length === 0 && (
              <div className="text-center py-4">
                <FaUserInjured
                  className="text-muted mb-3"
                  size={30}
                />

                <p className="fw-semibold mb-1">
                  No patients yet
                </p>

                <p className="text-muted small mb-0">
                  Patients within your care scope will
                  appear here.
                </p>
              </div>
            )}

          {!loadingPatients &&
            !patientError &&
            recentPatients.length > 0 && (
              <>
                <div className="row g-3">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="col-12 col-md-6 col-lg-4 col-xl"
                    >
                      <div className="border rounded p-3 h-100">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-success-subtle p-2">
                            <FaUserInjured
                              className="text-success"
                              size={13}
                            />
                          </div>

                          <div className="overflow-hidden">
                            <div className="fw-semibold text-truncate">
                              {patient.name ||
                                patient.full_name ||
                                `${patient.first_name || ""} ${
                                  patient.last_name || ""
                                }`.trim() ||
                                "Patient"}
                            </div>

                            {patient.email && (
                              <small className="text-muted text-truncate d-block">
                                {patient.email}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-outline-success w-100 mt-4">
                  View All Patients
                  <FaArrowRight
                    className="ms-2"
                    size={12}
                  />
                </button>
              </>
            )}
        </div>
      </div>

      {/* =========================
          QUICK CLINICAL SUMMARY
      ========================== */}

      <div className="row g-4">
        {/* Follow-ups */}

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaClock className="text-warning" />

                <h5 className="fw-bold mb-0">
                  Follow-up Summary
                </h5>
              </div>

              <p className="text-muted small mb-3">
                Appointments that may require your attention.
              </p>

              {loadingAppointments ? (
                <p className="text-muted small mb-0">
                  Loading...
                </p>
              ) : pendingFollowUps.length === 0 ? (
                <div className="text-center py-3">
                  <p className="fw-semibold mb-1">
                    No pending follow-ups
                  </p>

                  <p className="text-muted small mb-0">
                    You're all caught up.
                  </p>
                </div>
              ) : (
                <div>
                  {pendingFollowUps
                    .slice(0, 3)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border-bottom py-2"
                      >
                        <div className="fw-semibold">
                          {resolvePatientName(
                            appointment
                          )}
                        </div>

                        <small className="text-muted">
                          {formatDate(
                            appointment.appointment_date ||
                              appointment.date ||
                              appointment.scheduled_date
                          )}
                        </small>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latest Notification */}

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaBell className="text-warning" />

                <h5 className="fw-bold mb-0">
                  Latest Notification
                </h5>
              </div>

              <p className="text-muted small mb-3">
                Your most recent system update.
              </p>

              {loadingNotifications ? (
                <p className="text-muted small mb-0">
                  Loading...
                </p>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-3">
                  <p className="fw-semibold mb-1">
                    No notifications
                  </p>

                  <p className="text-muted small mb-0">
                    You're up to date.
                  </p>
                </div>
              ) : (
                <div className="bg-light rounded p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="fw-semibold">
                      {recentNotifications[0].title ||
                        "Notification"}
                    </span>

                    {!recentNotifications[0].is_read && (
                      <span className="badge bg-warning text-dark">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-muted small mt-2 mb-1">
                    {recentNotifications[0].message ||
                      "You have a new notification."}
                  </p>

                  {recentNotifications[0].created_at && (
                    <small className="text-muted">
                      {formatDate(
                        recentNotifications[0].created_at
                      )}
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;