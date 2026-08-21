import React, { useEffect, useState } from "react";
import { FaCalendarCheck, FaUserInjured, FaNotesMedical } from "react-icons/fa";
import {
  FaClock,
  FaStethoscope,
  FaPills,
  FaBell,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa6";

import { getProfile } from "../../services/profileService";
import { getAppointments } from "../../services/AppointmentService";
import { getPatients } from "../../services/PatientService";
import { getVisits } from "../../services/VisitService";
import { getDiagnoses } from "../../services/diagnosisService";
import { getNotifications } from "../../services/notificationService";
import { getClinicalRecords } from "../../services/ClinicalService";

// =========================
// GREETING
// =========================

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "morning";
  }

  if (hour < 17) {
    return "afternoon";
  }

  return "evening";
};

// =========================
// NORMALIZE LIST RESPONSE
// =========================

/*
 * Handles different possible API
 * response structures.
 */

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
    record.patient_name ||
    record.patient?.name ||
    (typeof record.patient === "string" ? record.patient : "") ||
    "Patient"
  );
};

// =========================
// DATE FORMATTING
// =========================

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const isSameDay = (dateA, dateB) => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

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
  // VISITS
  // =========================

  const [visits, setVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [visitError, setVisitError] = useState("");

  // =========================
  // DIAGNOSES
  // =========================

  const [diagnoses, setDiagnoses] = useState([]);
  const [loadingDiagnoses, setLoadingDiagnoses] = useState(true);
  const [diagnosisError, setDiagnosisError] = useState("");

  // =========================
  // NOTIFICATIONS
  // =========================

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  // =========================
  // CLINICAL RECORDS (RECOVERY)
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
        console.error("Unable to load patients:", error);

        setPatientError("Unable to load your patient list.");
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, []);

  // =========================
  // LOAD VISITS
  // =========================

  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoadingVisits(true);
        setVisitError("");

        const response = await getVisits();

        console.log("DOCTOR DASHBOARD VISITS:", response);

        setVisits(normalizeList(response));
      } catch (error) {
        console.error("Unable to load visits:", error);

        setVisitError("Unable to load recent visits.");
      } finally {
        setLoadingVisits(false);
      }
    };

    loadVisits();
  }, []);

  // =========================
  // LOAD DIAGNOSES
  // =========================

  useEffect(() => {
    const loadDiagnoses = async () => {
      try {
        setLoadingDiagnoses(true);
        setDiagnosisError("");

        const response = await getDiagnoses();

        console.log("DOCTOR DASHBOARD DIAGNOSES:", response);

        setDiagnoses(normalizeList(response));
      } catch (error) {
        console.error("Unable to load diagnoses:", error);

        setDiagnosisError("Unable to load recent diagnoses.");
      } finally {
        setLoadingDiagnoses(false);
      }
    };

    loadDiagnoses();
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

        setNotificationError("Unable to load your notifications.");
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, []);

  // =========================
  // LOAD CLINICAL RECORDS
  // =========================

  useEffect(() => {
    const loadClinicalRecords = async () => {
      try {
        setLoadingClinical(true);
        setClinicalError("");

        const response = await getClinicalRecords();

        console.log("DOCTOR DASHBOARD CLINICAL RECORDS:", response);

        setClinicalRecords(normalizeList(response));
      } catch (error) {
        console.error("Unable to load clinical records:", error);

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
    `Dr. ${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    profile?.username ||
    "Doctor";

  // =========================
  // DERIVED: TODAY'S APPOINTMENTS
  // =========================

  const today = new Date();

  const todaysAppointments = appointments
    .filter((appointment) => {
      const appointmentDate =
        appointment.appointment_date ||
        appointment.date ||
        appointment.scheduled_date;

      if (!appointmentDate) return false;

      return isSameDay(new Date(appointmentDate), today);
    })
    .sort((a, b) => {
      const dateA = new Date(
        a.appointment_date || a.date || a.scheduled_date,
      );
      const dateB = new Date(
        b.appointment_date || b.date || b.scheduled_date,
      );

      return dateA - dateB;
    });

  // =========================
  // DERIVED: PENDING FOLLOW-UPS
  // =========================

  const pendingFollowUps = appointments
    .filter((appointment) => {
      const status = String(appointment.status || "").toLowerCase();

      return (
        status === "pending" ||
        status === "scheduled" ||
        status === "follow_up" ||
        status === "follow-up"
      );
    })
    .slice(0, 5);

  // =========================
  // DERIVED: RECENT VISITS
  // =========================

  const recentVisits = [...visits]
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.visit_date || 0);
      const dateB = new Date(b.created_at || b.visit_date || 0);

      return dateB - dateA;
    })
    .slice(0, 5);

  // =========================
  // DERIVED: RECENT DIAGNOSES
  // =========================

  const recentDiagnoses = [...diagnoses]
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.diagnosis_date || 0);
      const dateB = new Date(b.created_at || b.diagnosis_date || 0);

      return dateB - dateA;
    })
    .slice(0, 5);

  // =========================
  // DERIVED: MISSED MEDICATION ALERTS
  // =========================

  const missedMedicationAlerts = notifications
    .filter((notification) => {
      const type = String(
        notification.notification_type ||
          notification.type ||
          notification.title ||
          "",
      ).toLowerCase();

      return (
        type.includes("missed") ||
        type.includes("medication") ||
        type.includes("dose")
      );
    })
    .slice(0, 5);

  // =========================
  // DERIVED: RECENT NOTIFICATIONS
  // =========================

  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  // =========================
  // DERIVED: RECOVERY UPDATES
  // =========================

  const recoveryUpdates = clinicalRecords
    .filter(
      (record) =>
        record.improvement_percentage !== undefined ||
        record.feeling_better !== undefined ||
        record.pain_level !== undefined,
    )
    .slice(0, 5);

  return (
    <div className="container-fluid py-4">
      {/* =========================
          WELCOME SECTION
      ========================== */}

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          {loadingProfile
            ? "Welcome 👋"
            : `Good ${getGreeting()}, ${doctorName} 👋`}
        </h2>

        <p className="text-muted mb-0">
          Overview of your patients, appointments and clinical activity.
        </p>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================== */}

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Today's Appointments</p>
                  <h3 className="fw-bold mb-0">
                    {loadingAppointments ? "-" : todaysAppointments.length}
                  </h3>
                </div>

                <FaCalendarCheck className="text-primary" size={26} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Patients</p>
                  <h3 className="fw-bold mb-0">
                    {loadingPatients ? "-" : patients.length}
                  </h3>
                </div>

                <FaUserInjured className="text-success" size={26} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Recent Visits</p>
                  <h3 className="fw-bold mb-0">
                    {loadingVisits ? "-" : visits.length}
                  </h3>
                </div>

                <FaStethoscope className="text-info" size={26} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Diagnoses</p>
                  <h3 className="fw-bold mb-0">
                    {loadingDiagnoses ? "-" : diagnoses.length}
                  </h3>
                </div>

                <FaNotesMedical className="text-secondary" size={26} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          DASHBOARD GRID
      ========================== */}

      <div className="row g-4">
        {/* =========================
            TODAY'S APPOINTMENTS
        ========================== */}

        <div className="col-12">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaCalendarCheck className="text-primary" />

                    <h5 className="fw-bold mb-0">Today's Appointments</h5>
                  </div>

                  <p className="text-muted mb-0">
                    Appointments scheduled under your name
                  </p>
                </div>

                {!loadingAppointments && todaysAppointments.length > 0 && (
                  <span className="badge bg-primary-subtle text-primary">
                    {todaysAppointments.length}
                  </span>
                )}
              </div>

              {/* Loading */}

              {loadingAppointments && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  />

                  <p className="text-muted small mt-2 mb-0">
                    Loading appointments...
                  </p>
                </div>
              )}

              {/* Error */}

              {!loadingAppointments && appointmentError && (
                <div className="alert alert-danger small">
                  {appointmentError}
                </div>
              )}

              {/* Empty */}

              {!loadingAppointments &&
                !appointmentError &&
                todaysAppointments.length === 0 && (
                  <div className="text-center py-4">
                    <FaCalendarCheck className="text-muted mb-3" size={30} />

                    <p className="fw-semibold mb-1">No appointments today</p>

                    <p className="text-muted small mb-0">
                      You have no appointments scheduled for today.
                    </p>
                  </div>
                )}

              {/* Table */}

              {!loadingAppointments &&
                !appointmentError &&
                todaysAppointments.length > 0 && (
                  <>
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {todaysAppointments.map((appointment) => (
                            <tr key={appointment.id}>
                              <td>{resolvePatientName(appointment)}</td>

                              <td>
                                {formatTime(
                                  appointment.appointment_date ||
                                    appointment.date ||
                                    appointment.scheduled_date,
                                )}
                              </td>

                              <td>
                                <span className="badge bg-primary-subtle text-primary">
                                  {appointment.status || "Scheduled"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button className="btn btn-outline-primary w-100 mt-2">
                      View All Appointments
                      <FaArrowRight className="ms-2" size={12} />
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* =========================
            ASSIGNED PATIENTS
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaUserInjured className="text-success" />

                <h5 className="fw-bold mb-0">Assigned Patients</h5>
              </div>

              <p className="text-muted mb-3">
                Patients currently under your care
              </p>

              {/* Loading */}

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

              {/* Error */}

              {!loadingPatients && patientError && (
                <div className="alert alert-danger small">{patientError}</div>
              )}

              {/* Empty */}

              {!loadingPatients && !patientError && patients.length === 0 && (
                <div className="text-center py-4">
                  <FaUserInjured className="text-muted mb-3" size={30} />

                  <p className="fw-semibold mb-1">No patients yet</p>

                  <p className="text-muted small mb-0">
                    You don't have any patients assigned to you yet.
                  </p>
                </div>
              )}

              {/* List */}

              {!loadingPatients && !patientError && patients.length > 0 && (
                <>
                  {patients.slice(0, 5).map((patient) => (
                    <div
                      key={patient.id}
                      className="d-flex justify-content-between align-items-center border-bottom py-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-success-subtle p-2">
                          <FaUserInjured className="text-success" size={12} />
                        </div>

                        <span className="fw-semibold">
                          {patient.name ||
                            patient.full_name ||
                            `${patient.first_name || ""} ${
                              patient.last_name || ""
                            }`.trim() ||
                            "Patient"}
                        </span>
                      </div>

                      <small className="text-muted">
                        {patient.email || ""}
                      </small>
                    </div>
                  ))}

                  <button className="btn btn-outline-success w-100 mt-3">
                    View All Patients
                    <FaArrowRight className="ms-2" size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* =========================
            PENDING FOLLOW-UPS
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaClock className="text-warning" />

                <h5 className="fw-bold mb-0">Pending Follow-ups</h5>
              </div>

              <p className="text-muted mb-3">
                Appointments awaiting confirmation or follow-up
              </p>

              {/* Loading */}

              {loadingAppointments && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-warning"
                    role="status"
                  />

                  <p className="text-muted small mt-2 mb-0">
                    Loading follow-ups...
                  </p>
                </div>
              )}

              {/* Error */}

              {!loadingAppointments && appointmentError && (
                <div className="alert alert-danger small">
                  {appointmentError}
                </div>
              )}

              {/* Empty */}

              {!loadingAppointments &&
                !appointmentError &&
                pendingFollowUps.length === 0 && (
                  <div className="text-center py-4">
                    <FaClock className="text-muted mb-3" size={30} />

                    <p className="fw-semibold mb-1">No pending follow-ups</p>

                    <p className="text-muted small mb-0">
                      You're all caught up.
                    </p>
                  </div>
                )}

              {/* List */}

              {!loadingAppointments &&
                !appointmentError &&
                pendingFollowUps.length > 0 && (
                  <>
                    {pendingFollowUps.map((appointment) => (
                      <div key={appointment.id} className="border-bottom py-3">
                        <div className="fw-semibold">
                          {resolvePatientName(appointment)}
                        </div>

                        <small className="text-muted">
                          {formatDate(
                            appointment.appointment_date ||
                              appointment.date ||
                              appointment.scheduled_date,
                          )}
                        </small>
                      </div>
                    ))}

                    <button className="btn btn-outline-warning w-100 mt-3">
                      View All Follow-ups
                      <FaArrowRight className="ms-2" size={12} />
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* =========================
            RECENT VISITS
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <FaStethoscope className="text-info" />

                    <h5 className="fw-bold mb-0">Recent Visits</h5>
                  </div>

                  <p className="text-muted mb-0 mt-1">
                    Recently logged patient visits
                  </p>
                </div>
              </div>

              {/* Loading */}

              {loadingVisits && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-info"
                    role="status"
                  />

                  <p className="text-muted small mt-2 mb-0">
                    Loading visits...
                  </p>
                </div>
              )}

              {/* Error */}

              {!loadingVisits && visitError && (
                <div className="alert alert-danger small">{visitError}</div>
              )}

              {/* Empty */}

              {!loadingVisits && !visitError && recentVisits.length === 0 && (
                <div className="text-center py-4">
                  <FaStethoscope className="text-muted mb-3" size={28} />

                  <p className="fw-semibold mb-1">No visit records yet</p>

                  <p className="text-muted small mb-0">
                    Log a patient visit to see it appear here.
                  </p>
                </div>
              )}

              {/* List */}

              {!loadingVisits && !visitError && recentVisits.length > 0 && (
                <>
                  {recentVisits.map((visit) => (
                    <div key={visit.id} className="border-bottom py-3">
                      <div className="fw-semibold">
                        {resolvePatientName(visit)}
                      </div>

                      <small className="text-muted">
                        {formatDate(visit.visit_date || visit.created_at)}
                      </small>
                    </div>
                  ))}

                  <button className="btn btn-outline-info w-100 mt-3">
                    View All Visits
                    <FaArrowRight className="ms-2" size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* =========================
            RECENT DIAGNOSES
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaNotesMedical className="text-secondary" />

                <h5 className="fw-bold mb-0">Recent Diagnoses</h5>
              </div>

              <p className="text-muted mb-3">
                Diagnoses recently recorded for your patients
              </p>

              {/* Loading */}

              {loadingDiagnoses && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-secondary"
                    role="status"
                  />

                  <p className="text-muted small mt-2 mb-0">
                    Loading diagnoses...
                  </p>
                </div>
              )}

              {/* Error */}

              {!loadingDiagnoses && diagnosisError && (
                <div className="alert alert-danger small">
                  {diagnosisError}
                </div>
              )}

              {/* Empty */}

              {!loadingDiagnoses &&
                !diagnosisError &&
                recentDiagnoses.length === 0 && (
                  <div className="text-center py-4">
                    <FaNotesMedical className="text-muted mb-3" size={28} />

                    <p className="fw-semibold mb-1">No recent diagnoses</p>

                    <p className="text-muted small mb-0">
                      Diagnoses you record will appear here.
                    </p>
                  </div>
                )}

              {/* List */}

              {!loadingDiagnoses &&
                !diagnosisError &&
                recentDiagnoses.length > 0 && (
                  <>
                    {recentDiagnoses.map((diagnosis) => (
                      <div key={diagnosis.id} className="border-bottom py-3">
                        <div className="fw-semibold">
                          {diagnosis.condition || diagnosis.name || "Diagnosis"}
                        </div>

                        <small className="text-muted">
                          Patient: {resolvePatientName(diagnosis)}
                        </small>
                      </div>
                    ))}

                    <button className="btn btn-outline-secondary w-100 mt-3">
                      View All Diagnoses
                      <FaArrowRight className="ms-2" size={12} />
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

                <h5 className="fw-bold mb-0">Patient Recovery Updates</h5>
              </div>

              <p className="text-muted mb-3">
                Progress reported by your patients
              </p>

              {/* Loading */}

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

              {/* Error */}

              {!loadingClinical && clinicalError && (
                <div className="alert alert-danger small">
                  {clinicalError}
                </div>
              )}

              {/* Empty */}

              {!loadingClinical &&
                !clinicalError &&
                recoveryUpdates.length === 0 && (
                  <div className="text-center py-4">
                    <FaChartLine className="text-muted mb-3" size={28} />

                    <p className="fw-semibold mb-1">
                      No recovery updates available
                    </p>

                    <p className="text-muted small mb-0">
                      Patient progress reports will appear here.
                    </p>
                  </div>
                )}

              {/* List */}

              {!loadingClinical &&
                !clinicalError &&
                recoveryUpdates.length > 0 && (
                  <>
                    {recoveryUpdates.map((record) => (
                      <div key={record.id} className="border-bottom py-3">
                        <div className="fw-semibold">
                          {resolvePatientName(record)}
                        </div>

                        {record.improvement_percentage !== undefined && (
                          <small className="text-muted d-block">
                            Improvement:{" "}
                            <strong>{record.improvement_percentage}%</strong>
                          </small>
                        )}

                        {record.pain_level !== undefined && (
                          <small className="text-muted d-block">
                            Pain level: {record.pain_level}
                          </small>
                        )}
                      </div>
                    ))}

                    <button className="btn btn-outline-info w-100 mt-3">
                      View All Recovery Updates
                      <FaArrowRight className="ms-2" size={12} />
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* =========================
            MISSED MEDICATION ALERTS
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaPills className="text-danger" />

                <h5 className="fw-bold mb-0">Missed Medication Alerts</h5>
              </div>

              <p className="text-muted mb-3">
                Patients who may have missed a dose
              </p>

              {/* Loading */}

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

              {/* Error */}

              {!loadingNotifications && notificationError && (
                <div className="alert alert-danger small">
                  {notificationError}
                </div>
              )}

              {/* Empty */}

              {!loadingNotifications &&
                !notificationError &&
                missedMedicationAlerts.length === 0 && (
                  <div className="text-center py-4">
                    <FaPills className="text-muted mb-3" size={28} />

                    <p className="fw-semibold mb-1">
                      No missed medication alerts
                    </p>

                    <p className="text-muted small mb-0">
                      You're all caught up here.
                    </p>
                  </div>
                )}

              {/* List */}

              {!loadingNotifications &&
                !notificationError &&
                missedMedicationAlerts.length > 0 && (
                  <>
                    {missedMedicationAlerts.map((notification) => (
                      <div
                        key={notification.id}
                        className="d-flex align-items-start gap-3 p-3 bg-danger-subtle rounded mb-2"
                      >
                        <FaPills className="text-danger mt-1" size={14} />

                        <div>
                          <div className="fw-semibold">
                            {notification.title || "Medication Alert"}
                          </div>

                          <small className="text-muted">
                            {notification.message ||
                              "A patient may have missed a medication dose."}
                          </small>
                        </div>
                      </div>
                    ))}

                    <button className="btn btn-outline-danger w-100 mt-3">
                      View All Alerts
                      <FaArrowRight className="ms-2" size={12} />
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* =========================
            NOTIFICATIONS
        ========================== */}

        <div className="col-12">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <FaBell className="text-warning" />

                    <h5 className="fw-bold mb-0">Recent Notifications</h5>
                  </div>

                  <p className="text-muted mb-0 mt-1">
                    Important updates for you
                  </p>
                </div>

                {recentNotifications.some(
                  (notification) => !notification.is_read,
                ) && (
                  <span className="badge bg-warning-subtle text-warning">
                    New
                  </span>
                )}
              </div>

              {/* Loading */}

              {loadingNotifications && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-warning"
                    role="status"
                  />

                  <p className="text-muted small mt-2 mb-0">
                    Loading notifications...
                  </p>
                </div>
              )}

              {/* Error */}

              {!loadingNotifications && notificationError && (
                <div className="alert alert-danger small">
                  {notificationError}
                </div>
              )}

              {/* Empty */}

              {!loadingNotifications &&
                !notificationError &&
                recentNotifications.length === 0 && (
                  <div className="text-center py-4">
                    <FaBell className="text-muted mb-3" size={28} />

                    <p className="fw-semibold mb-1">No notifications</p>

                    <p className="text-muted small mb-0">
                      You don't have any new notifications.
                    </p>
                  </div>
                )}

              {/* List */}

              {!loadingNotifications &&
                !notificationError &&
                recentNotifications.length > 0 && (
                  <div className="mt-3">
                    {recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`d-flex align-items-start gap-3 p-3 rounded mb-2 ${
                          notification.is_read
                            ? "bg-light"
                            : "bg-warning-subtle"
                        }`}
                      >
                        <FaBell
                          className={
                            notification.is_read
                              ? "text-muted mt-1"
                              : "text-warning mt-1"
                          }
                          size={14}
                        />

                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <span className="fw-semibold">
                              {notification.title || "Notification"}
                            </span>

                            {!notification.is_read && (
                              <span className="badge bg-warning text-dark ms-2">
                                New
                              </span>
                            )}
                          </div>

                          <p className="text-muted small mb-0 mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              <button className="btn btn-outline-warning w-100 mt-3">
                View All Notifications
                <FaArrowRight className="ms-2" size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;