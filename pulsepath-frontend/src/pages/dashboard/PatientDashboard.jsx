import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaPills,
  FaBell,
  FaChartLine,
  FaComments,
  FaUserMd,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

import { getProfile } from "../../services/profileService";
import { getAppointments } from "../../services/appointmentService";

import { getMedicationSchedules } from "../../services/Treatment/medicationScheduleService";

import { getMedicationLogs } from "../../services/Treatment/medicationLogService";

import { getNotifications } from "../../services/notificationService";
import { getRecoveryProgress } from "../../services/recoveryProgressService";

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
// APPOINTMENT DATE
// =========================

const formatAppointmentDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// =========================
// APPOINTMENT TIME
// =========================

const formatAppointmentTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// =========================
// MEDICATION TIME
// =========================

const formatMedicationTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

function PatientDashboard() {
  // =========================
  // PROFILE
  // =========================

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // =========================
  // APPOINTMENTS
  // =========================

  const [nextAppointment, setNextAppointment] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [appointmentError, setAppointmentError] = useState("");

  // =========================
  // MEDICATIONS
  // =========================

  const [todayMedications, setTodayMedications] = useState([]);
  const [loadingMedications, setLoadingMedications] = useState(true);
  const [medicationError, setMedicationError] = useState("");

  // =========================
  // NOTIFICATIONS
  // =========================

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  const [recovery, setRecovery] = useState(null);
  const [loadingRecovery, setLoadingRecovery] = useState(true);
  const [recoveryError, setRecoveryError] = useState("");

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        console.log("PATIENT DASHBOARD PROFILE:", data);

        setProfile(data);
      } catch (error) {
        console.error("Unable to load patient profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadRecoveryProgress = async () => {
      try {
        setLoadingRecovery(true);
        setRecoveryError("");

        const data = await getRecoveryProgress();

        console.log("PATIENT DASHBOARD RECOVERY:", data);

        if (!Array.isArray(data) || data.length === 0) {
          setRecovery(null);
          return;
        }

        // Get the most recently recorded recovery update.
        const sortedRecovery = [...data].sort(
          (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at),
        );

        setRecovery(sortedRecovery[0]);
      } catch (error) {
        console.error("Unable to load recovery progress:", error);

        setRecoveryError("Unable to load your recovery progress.");
      } finally {
        setLoadingRecovery(false);
      }
    };

    loadRecoveryProgress();
  }, []);

  // =========================
  // LOAD APPOINTMENTS
  // =========================

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoadingAppointment(true);
        setAppointmentError("");

        const appointments = await getAppointments();

        console.log("PATIENT DASHBOARD APPOINTMENTS:", appointments);

        if (!Array.isArray(appointments)) {
          setNextAppointment(null);
          return;
        }

        const now = new Date();

        const upcomingAppointments = appointments.filter((appointment) => {
          if (!appointment?.appointment_date) {
            return false;
          }

          const appointmentDate = new Date(appointment.appointment_date);

          if (appointmentDate <= now) {
            return false;
          }

          if (
            appointment.status === "COMPLETED" ||
            appointment.status === "CANCELLED"
          ) {
            return false;
          }

          return true;
        });

        upcomingAppointments.sort(
          (a, b) => new Date(a.appointment_date) - new Date(b.appointment_date),
        );

        setNextAppointment(
          upcomingAppointments.length > 0 ? upcomingAppointments[0] : null,
        );
      } catch (error) {
        console.error("Unable to load appointments:", error);

        setAppointmentError("Unable to load your appointment.");
      } finally {
        setLoadingAppointment(false);
      }
    };

    loadAppointments();
  }, []);

  // =========================
  // LOAD TODAY'S MEDICATIONS
  // =========================

  useEffect(() => {
    const loadTodayMedications = async () => {
      try {
        setLoadingMedications(true);
        setMedicationError("");

        const [schedules, logs] = await Promise.all([
          getMedicationSchedules(),
          getMedicationLogs(),
        ]);

        console.log("PATIENT DASHBOARD MEDICATION SCHEDULES:", schedules);

        console.log("PATIENT DASHBOARD MEDICATION LOGS:", logs);

        if (!Array.isArray(schedules)) {
          setTodayMedications([]);
          return;
        }

        const now = new Date();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySchedules = schedules.filter((schedule) => {
          if (!schedule?.scheduled_time) {
            return false;
          }

          if (schedule.is_active === false) {
            return false;
          }

          const scheduledDate = new Date(schedule.scheduled_time);

          const scheduledDay = new Date(scheduledDate);

          scheduledDay.setHours(0, 0, 0, 0);

          const startDate = schedule.start_date
            ? new Date(`${schedule.start_date}T00:00:00`)
            : null;

          const endDate = schedule.end_date
            ? new Date(`${schedule.end_date}T23:59:59`)
            : null;

          if (startDate && today < startDate) {
            return false;
          }

          if (endDate && today > endDate) {
            return false;
          }

          return scheduledDay >= today && scheduledDay < tomorrow;
        });

        const medicationData = todaySchedules.map((schedule) => {
          const scheduleLogs = Array.isArray(logs)
            ? logs.filter(
                (log) =>
                  Number(log?.medication_schedule) === Number(schedule.id),
              )
            : [];

          const latestLog =
            scheduleLogs.length > 0
              ? [...scheduleLogs].sort(
                  (a, b) =>
                    new Date(b.taken_at || 0) - new Date(a.taken_at || 0),
                )[0]
              : null;

          let status = "UPCOMING";

          if (latestLog?.status === "TAKEN") {
            status = "TAKEN";
          } else if (latestLog?.status === "MISSED") {
            status = "MISSED";
          } else if (latestLog?.status === "SKIPPED") {
            status = "SKIPPED";
          } else {
            const scheduledTime = new Date(schedule.scheduled_time);

            if (scheduledTime < now) {
              status = "MISSED";
            }
          }

          return {
            id: schedule.id,
            name: schedule.prescription_details || "Medication",
            time: schedule.scheduled_time,
            status,
          };
        });

        medicationData.sort((a, b) => new Date(a.time) - new Date(b.time));

        setTodayMedications(medicationData);
      } catch (error) {
        console.error("Unable to load today's medications:", error);

        setMedicationError("Unable to load today's medications.");
      } finally {
        setLoadingMedications(false);
      }
    };

    loadTodayMedications();
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

        console.log("PATIENT DASHBOARD NOTIFICATIONS:", response);

        /*
         * Handles different possible API
         * response structures.
         */

        const data =
          response?.data?.results ??
          response?.results ??
          response?.data ??
          response;

        if (!Array.isArray(data)) {
          setNotifications([]);
          return;
        }

        const sortedNotifications = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        /*
         * Keep the dashboard concise.
         * The full notification page can
         * display everything.
         */

        setNotifications(sortedNotifications.slice(0, 3));
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
  // PATIENT NAME
  // =========================

  const patientName =
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    profile?.username ||
    "Patient";

  // =========================
  // TEMPORARY RECOVERY DATA
  // =========================

  /*
   * We will connect this to the
   * Recovery Progress endpoint later.
   */

  // =========================
  // TEMPORARY MESSAGE
  // =========================

  /*
   * We will connect this to the
   * messaging/chat endpoint later.
   */

  const latestMessage = {
    sender: "Your healthcare team",
    message: "You have a new message from your healthcare team.",
  };

  return (
    <div className="container-fluid py-4">
      {/* =========================
          WELCOME SECTION
      ========================== */}

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          {loadingProfile
            ? "Welcome 👋"
            : `Good ${getGreeting()}, ${patientName} 👋`}
        </h2>

        <p className="text-muted mb-0">Here's your health summary for today.</p>
      </div>

      {/* =========================
          DASHBOARD GRID
      ========================== */}

      <div className="row g-4">
        {/* =========================
            NEXT APPOINTMENT
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaCalendarAlt className="text-primary" />

                    <h5 className="fw-bold mb-0">Next Appointment</h5>
                  </div>

                  <p className="text-muted mb-0">Your upcoming appointment</p>
                </div>

                {nextAppointment && (
                  <span className="badge bg-primary-subtle text-primary">
                    {nextAppointment.status}
                  </span>
                )}
              </div>

              {/* Loading */}

              {loadingAppointment && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  />

                  <p className="text-muted small mt-2 mb-0">
                    Loading appointment...
                  </p>
                </div>
              )}

              {/* Error */}

              {!loadingAppointment && appointmentError && (
                <div className="alert alert-danger small">
                  {appointmentError}
                </div>
              )}

              {/* Empty */}

              {!loadingAppointment && !appointmentError && !nextAppointment && (
                <div className="text-center py-4">
                  <FaCalendarAlt className="text-muted mb-3" size={30} />

                  <p className="fw-semibold mb-1">No upcoming appointments</p>

                  <p className="text-muted small mb-0">
                    You currently have no upcoming appointments.
                  </p>
                </div>
              )}

              {/* Appointment */}

              {!loadingAppointment && !appointmentError && nextAppointment && (
                <>
                  <div className="mt-4">
                    <div className="d-flex align-items-center mb-3">
                      <FaUserMd className="text-muted me-3" />

                      <div>
                        <small className="text-muted">Doctor</small>

                        <div className="fw-semibold">
                          {nextAppointment.doctor_name || "Doctor"}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <FaCalendarAlt className="text-muted me-3" />

                      <div>
                        <small className="text-muted">Date</small>

                        <div className="fw-semibold">
                          {formatAppointmentDate(
                            nextAppointment.appointment_date,
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <FaClock className="text-muted me-3" />

                      <div>
                        <small className="text-muted">Time</small>

                        <div className="fw-semibold">
                          {formatAppointmentTime(
                            nextAppointment.appointment_date,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-outline-primary w-100">
                    View Appointment
                    <FaArrowRight className="ms-2" size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* =========================
            TODAY'S MEDICATIONS
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaPills className="text-success" />

                <h5 className="fw-bold mb-0">Today's Medications</h5>
              </div>

              <p className="text-muted mb-3">
                Your medication schedule for today
              </p>

              {/* Loading */}

              {loadingMedications && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-success"
                    role="status"
                  />

                  <p className="text-muted small mt-2 mb-0">
                    Loading medications...
                  </p>
                </div>
              )}

              {/* Error */}

              {!loadingMedications && medicationError && (
                <div className="alert alert-danger small">
                  {medicationError}
                </div>
              )}

              {/* Empty */}

              {!loadingMedications &&
                !medicationError &&
                todayMedications.length === 0 && (
                  <div className="text-center py-4">
                    <FaPills className="text-muted mb-3" size={30} />

                    <p className="fw-semibold mb-1">
                      No medications scheduled today
                    </p>

                    <p className="text-muted small mb-0">
                      You have no active medication schedules for today.
                    </p>
                  </div>
                )}

              {/* Medication List */}

              {!loadingMedications &&
                !medicationError &&
                todayMedications.length > 0 && (
                  <>
                    {todayMedications.map((medication) => (
                      <div
                        key={medication.id}
                        className="d-flex justify-content-between align-items-center border-bottom py-3"
                      >
                        <div>
                          <div className="fw-semibold">{medication.name}</div>

                          <small className="text-muted">
                            {formatMedicationTime(medication.time)}
                          </small>
                        </div>

                        {medication.status === "TAKEN" && (
                          <span className="badge bg-success-subtle text-success">
                            <FaCheckCircle className="me-1" />
                            Taken
                          </span>
                        )}

                        {medication.status === "UPCOMING" && (
                          <span className="badge bg-warning-subtle text-warning">
                            <FaClock className="me-1" />
                            Upcoming
                          </span>
                        )}

                        {medication.status === "MISSED" && (
                          <span className="badge bg-danger-subtle text-danger">
                            Missed
                          </span>
                        )}

                        {medication.status === "SKIPPED" && (
                          <span className="badge bg-secondary-subtle text-secondary">
                            Skipped
                          </span>
                        )}
                      </div>
                    ))}

                    <button className="btn btn-outline-success w-100 mt-3">
                      View Medications
                      <FaArrowRight className="ms-2" size={12} />
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* =========================
            REMINDERS / NOTIFICATIONS
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <FaBell className="text-warning" />

                    <h5 className="fw-bold mb-0">Reminders</h5>
                  </div>

                  <p className="text-muted mb-0 mt-1">
                    Important updates for you
                  </p>
                </div>

                {notifications.some(
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
                    Loading reminders...
                  </p>
                </div>
              )}

              {/* Error */}

              {!loadingNotifications && notificationError && (
                <div className="alert alert-danger small mt-3">
                  {notificationError}
                </div>
              )}

              {/* Empty */}

              {!loadingNotifications &&
                !notificationError &&
                notifications.length === 0 && (
                  <div className="text-center py-4">
                    <FaBell className="text-muted mb-3" size={28} />

                    <p className="fw-semibold mb-1">No reminders</p>

                    <p className="text-muted small mb-0">
                      You don't have any new reminders.
                    </p>
                  </div>
                )}

              {/* Notifications */}

              {!loadingNotifications &&
                !notificationError &&
                notifications.length > 0 && (
                  <div className="mt-3">
                    {notifications.map((notification) => (
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

                          <p className="text-muted small mb-1 mt-1">
                            {notification.message}
                          </p>

                          <small className="text-muted">
                            {new Date(
                              notification.created_at,
                            ).toLocaleDateString("en-KE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* View Notifications */}

              <button className="btn btn-outline-warning w-100 mt-3">
                View Notifications
                <FaArrowRight className="ms-2" size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* =========================
    RECOVERY PROGRESS
========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaChartLine className="text-info" />
                <h5 className="fw-bold mb-0">Your Recovery</h5>
              </div>

              <p className="text-muted mb-4">
                A simple view of your treatment progress
              </p>

              {/* Loading */}
              {loadingRecovery && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-info"
                    role="status"
                  />
                  <p className="text-muted small mt-2 mb-0">
                    Loading your recovery progress...
                  </p>
                </div>
              )}

              {/* Error */}
              {!loadingRecovery && recoveryError && (
                <div className="alert alert-danger small">{recoveryError}</div>
              )}

              {/* Empty */}
              {!loadingRecovery && !recoveryError && !recovery && (
                <div className="text-center py-4">
                  <FaChartLine className="text-muted mb-3" size={30} />
                  <p className="fw-semibold mb-1">No recovery data yet</p>
                  <p className="text-muted small mb-0">
                    Your treatment progress will appear here once it's recorded.
                  </p>
                </div>
              )}

              {/* Recovery */}
              {!loadingRecovery && !recoveryError && recovery && (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-semibold">Treatment Progress</span>
                      <span className="fw-bold">{recovery.progress}%</span>
                    </div>

                    <div className="progress" style={{ height: "10px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${recovery.progress}%` }}
                        aria-valuenow={recovery.progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      <small className="text-muted">Feeling better</small>
                      <div className="fw-semibold">
                        {recovery.feelingBetter ? "Yes" : "Not yet"}
                      </div>
                    </div>

                    <div>
                      <small className="text-muted">Last updated</small>
                      <div className="fw-semibold">{recovery.lastUpdated}</div>
                    </div>
                  </div>
                </>
              )}

              <button className="btn btn-outline-info w-100 mt-4">
                View Recovery
                <FaArrowRight className="ms-2" size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* =========================
            MESSAGES
        ========================== */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaComments className="text-secondary" />

                <h5 className="fw-bold mb-0">Messages</h5>
              </div>

              <p className="text-muted mb-4">
                Messages from your healthcare team
              </p>

              <div className="d-flex align-items-start gap-3 p-3 bg-light rounded">
                <div className="rounded-circle bg-secondary-subtle p-3">
                  <FaUserMd className="text-secondary" />
                </div>

                <div>
                  <div className="fw-semibold">{latestMessage.sender}</div>

                  <p className="text-muted small mb-0 mt-1">
                    {latestMessage.message}
                  </p>
                </div>
              </div>

              <button className="btn btn-outline-secondary w-100 mt-3">
                View Messages
                <FaArrowRight className="ms-2" size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
