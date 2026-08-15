import { useEffect, useState } from "react";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from "../../services/AppointmentService";
import { getPatients } from "../../services/PatientService";
import { getDoctors } from "../../services/DoctorService";
import { useAuth } from "../../contexts/AuthContext";

// Default form values.
// Patient ID is intentionally NOT included because patients should not
// select themselves when booking an appointment.
const initialFormState = {
  patient: "",
  doctor: "",
  appointment_date: "",
  status: "PENDING",
};

function Appointments() {
  // ---------------------------------------------------------
  // AUTHENTICATION / ROLE
  // ---------------------------------------------------------

  const { profile } = useAuth();

  const role = profile?.role;

  const isPatient = role === "PATIENT";
  const isDoctor = role === "DOCTOR";
  const isAdmin = role === "ADMIN";

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  // Used when ADMIN edits an existing appointment.
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState(initialFormState);

  // ---------------------------------------------------------
  // LOAD APPOINTMENT DATA
  // ---------------------------------------------------------

  useEffect(() => {
    if (!profile) return;

    loadData();
  }, [profile]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Everyone can get appointments.
      const appointmentData = await getAppointments();

      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);

      // -----------------------------------------------------
      // DOCTORS
      // -----------------------------------------------------
      //
      // Patients need doctors when booking.
      // Admins also need doctors when creating/editing.
      //
      if (isPatient || isAdmin) {
        try {
          const doctorData = await getDoctors();

          console.log("DOCTORS API RESPONSE:", doctorData);

          setDoctors(Array.isArray(doctorData) ? doctorData : []);
        } catch (doctorError) {
          console.error("DOCTORS LOAD ERROR:", doctorError);
        }
      }

      // -----------------------------------------------------
      // PATIENTS
      // -----------------------------------------------------
      //
      // ADMIN needs all patients for the appointment form.
      // PATIENT needs the patient list only so we can find
      // their own Patient record ID.
      if (isAdmin || isPatient) {
        try {
          const patientData = await getPatients();
          setPatients(Array.isArray(patientData) ? patientData : []);
        } catch (patientError) {
          console.error("PATIENTS LOAD ERROR:", patientError);
        }
      }
    } catch (err) {
      console.error("APPOINTMENTS ERROR:", err);
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // FIND CURRENT PATIENT ID
  // ---------------------------------------------------------
  //
  // profile.id is the User UUID, while the appointment API expects
  // the integer patient PK (e.g. patient: 1), not the user UUID.
  // We therefore look for the patient record associated with the
  // logged-in user.
  //
  const getCurrentPatientId = () => {
    if (!profile) return null;

    const directPatientId = Number(
      profile?.patient_id ?? profile?.patientId ?? profile?.patient?.id,
    );

    if (Number.isFinite(directPatientId) && directPatientId > 0) {
      return directPatientId;
    }

    const currentPatient = patients.find((patient) => {
      const patientUserId = patient?.user?.id ?? patient?.user_id ?? patient?.user;
      const patientEmail = patient?.user?.email ?? patient?.email;
      const normalizedPatientEmail = patientEmail ? String(patientEmail).toLowerCase() : "";
      const normalizedProfileEmail = profile?.email ? String(profile.email).toLowerCase() : "";

      return (
        (patientUserId && profile?.id && String(patientUserId) === String(profile.id)) ||
        (normalizedPatientEmail && normalizedProfileEmail && normalizedPatientEmail === normalizedProfileEmail)
      );
    });

    if (currentPatient?.id) {
      return Number(currentPatient.id);
    }

    return null;
  };

  const resolveCurrentPatientId = async () => {
    const patientIdFromList = getCurrentPatientId();

    if (patientIdFromList) {
      return patientIdFromList;
    }

    try {
      const patientData = await getPatients();
      const fallbackPatients = Array.isArray(patientData) ? patientData : [];
      const currentPatient = fallbackPatients.find((patient) => {
        const patientUserId = patient?.user?.id ?? patient?.user_id ?? patient?.user;
        const patientEmail = patient?.user?.email ?? patient?.email;
        const normalizedPatientEmail = patientEmail ? String(patientEmail).toLowerCase() : "";
        const normalizedProfileEmail = profile?.email ? String(profile.email).toLowerCase() : "";

        return (
          (patientUserId && profile?.id && String(patientUserId) === String(profile.id)) ||
          (normalizedPatientEmail && normalizedProfileEmail && normalizedPatientEmail === normalizedProfileEmail)
        );
      });

      return currentPatient?.id ? Number(currentPatient.id) : null;
    } catch (error) {
      console.error("PATIENT LOOKUP ERROR:", error);
      return null;
    }
  };


  // ---------------------------------------------------------
  // DATE FORMATTER
  // ---------------------------------------------------------

  const formatDate = (iso) => {
    if (!iso) return "—";

    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  // ---------------------------------------------------------
  // STATUS BADGE
  // ---------------------------------------------------------

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-success";

      case "COMPLETED":
        return "bg-primary";

      case "CANCELLED":
        return "bg-danger";

      default:
        return "bg-warning text-dark";
    }
  };

  // ---------------------------------------------------------
  // FORM INPUT HANDLER
  // ---------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // RESET FORM
  // ---------------------------------------------------------

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // ---------------------------------------------------------
  // CREATE / UPDATE APPOINTMENT
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Doctor and date are required for everyone creating
    // an appointment.
    if (!formData.doctor || !formData.appointment_date) {
      setError("Please select a doctor and appointment date.");
      return;
    }

    // -------------------------------------------------------
    // PATIENT BOOKING
    // -------------------------------------------------------
    //
    // Patients do NOT select a patient.
    // We obtain their patient ID from their authenticated profile.
    //
    let patientId = formData.patient;

    if (isPatient) {
      patientId = await resolveCurrentPatientId();

      if (!patientId) {
        setError(
          "Unable to determine your patient ID. Please check the patient profile data.",
        );
        return;
      }
    }

    // ADMIN must select a patient.
    if (isAdmin && !patientId) {
      setError("Please select a patient.");
      return;
    }

    try {
      setSaving(true);

      // -----------------------------------------------------
      // COMMON APPOINTMENT PAYLOAD
      // -----------------------------------------------------

      const payload = {
        patient: Number(patientId),
        doctor: Number(formData.doctor),
        appointment_date: new Date(formData.appointment_date).toISOString(),
      };

      // -----------------------------------------------------
      // ADMIN UPDATE
      // -----------------------------------------------------
      //
      // Admin can edit all appointment information.
      //

      if (isAdmin && editingId) {
        payload.status = formData.status;

        await updateAppointment(editingId, payload);

        setSuccess("Appointment updated successfully.");

        resetForm();

        await loadData();

        return;
      }

      // -----------------------------------------------------
      // CREATE APPOINTMENT
      // -----------------------------------------------------

      await createAppointment(payload);

      if (isPatient) {
        setSuccess("Appointment booked successfully.");
      } else {
        setSuccess("Appointment created successfully.");
      }

      resetForm();

      await loadData();
    } catch (err) {
      console.error("APPOINTMENT SAVE ERROR:", err);

      const backendMessage =
        err?.response?.data?.errors ||
        err?.response?.data?.message ||
        err?.response?.data?.detail;

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : editingId
            ? "Failed to update appointment."
            : "Failed to create appointment.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // ADMIN EDIT
  // ---------------------------------------------------------

  const handleEdit = (appointment) => {
    // Only ADMIN should be able to edit appointment details.
    if (!isAdmin) return;

    setEditingId(appointment.id);

    setFormData({
      patient: appointment.patient || "",
      doctor: appointment.doctor || "",
      appointment_date: appointment.appointment_date
        ? new Date(appointment.appointment_date).toISOString().slice(0, 16)
        : "",
      status: appointment.status || "PENDING",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  };

  // ---------------------------------------------------------
  // DELETE APPOINTMENT
  // ---------------------------------------------------------

  const handleDelete = async (id) => {
    // Only ADMIN can delete.
    if (!isAdmin) return;

    if (!window.confirm("Delete this appointment?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteAppointment(id);

      setSuccess("Appointment deleted successfully.");

      await loadData();
    } catch (err) {
      console.error("DELETE APPOINTMENT ERROR:", err);

      setError("Failed to delete appointment.");
    }
  };

  // ---------------------------------------------------------
  // DOCTOR: UPDATE APPOINTMENT STATUS
  // ---------------------------------------------------------

  const handleStatusChange = async (appointmentId, status) => {
    if (!isDoctor) return;

    try {
      setError("");
      setSuccess("");

      // Doctor only changes the status.
      // We don't send patient/doctor/date because those
      // appointment details should remain unchanged.
      await updateAppointment(appointmentId, {
        status,
      });

      setSuccess("Appointment status updated successfully.");

      await loadData();
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);

      const backendMessage =
        err?.response?.data?.errors ||
        err?.response?.data?.message ||
        err?.response?.data?.detail;

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : "Failed to update appointment status.",
      );
    }
  };

  // ---------------------------------------------------------
  // PAGE TITLE / DESCRIPTION
  // ---------------------------------------------------------

  const getPageTitle = () => {
    if (isPatient) return "My Appointments";
    if (isDoctor) return "My Appointments";
    return "All Appointments";
  };

  const getPageDescription = () => {
    if (isPatient) {
      return "Book and keep track of your medical appointments.";
    }

    if (isDoctor) {
      return "View your appointments and manage appointment status.";
    }

    return "Manage patient appointments and keep your schedule organized.";
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="container-fluid py-4">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">{getPageTitle()}</h2>

          <p className="text-muted mb-0">{getPageDescription()}</p>
        </div>

        {/* ---------------------------------------------------
            PATIENT + ADMIN CAN CREATE APPOINTMENTS
            --------------------------------------------------- */}

        {(isPatient || isAdmin) && (
          <button
            className="btn btn-primary"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
                setError("");
                setSuccess("");
              }
            }}
          >
            {showForm
              ? "Close form"
              : isPatient
                ? "+ Book Appointment"
                : "+ New Appointment"}
          </button>
        )}
      </div>

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* =====================================================
          APPOINTMENT FORM
      ====================================================== */}

      {showForm && (isPatient || isAdmin) && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              {editingId
                ? "Edit Appointment"
                : isPatient
                  ? "Book Appointment"
                  : "Create Appointment"}
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* ------------------------------------------------
                    ADMIN ONLY: SELECT PATIENT
                    ------------------------------------------------ */}

                {isAdmin && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Patient</label>

                    <select
                      className="form-select"
                      name="patient"
                      value={formData.patient}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a patient</option>

                      {patients.map((patient) => {
                        const patientName =
                          patient.user?.full_name ||
                          patient.user?.first_name ||
                          patient.user?.email ||
                          patient.full_name ||
                          patient.name ||
                          `Patient ${patient.id}`;

                        return (
                          <option key={patient.id} value={patient.id}>
                            {patientName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* ------------------------------------------------
                    DOCTOR SELECTION
                    ------------------------------------------------ */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Doctor</label>

                  <select
                    className="form-select"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a doctor</option>

                    {doctors.map((doctor) => {
                      const doctorName =
                        doctor.user?.full_name ||
                        doctor.user?.first_name ||
                        doctor.user?.email ||
                        doctor.full_name ||
                        doctor.name ||
                        `Doctor ${doctor.id}`;

                      return (
                        <option key={doctor.id} value={doctor.id}>
                          {doctorName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* ------------------------------------------------
                    APPOINTMENT DATE
                    ------------------------------------------------ */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Appointment Date
                  </label>

                  <input
                    type="datetime-local"
                    className="form-control"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* ------------------------------------------------
                    STATUS
                    ------------------------------------------------
                    
                    Only ADMIN sees the status field in the
                    create/edit form.
                    
                    Patients create appointments as PENDING.
                    Doctors update status from the table.
                */}

                {isAdmin && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>

                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="PENDING">Pending</option>

                      <option value="CONFIRMED">Confirmed</option>

                      <option value="COMPLETED">Completed</option>

                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>

              {/* --------------------------------------------------
                  FORM BUTTONS
                  -------------------------------------------------- */}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? editingId
                      ? "Saving..."
                      : "Booking..."
                    : editingId
                      ? "Save Changes"
                      : isPatient
                        ? "Book Appointment"
                        : "Create Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          APPOINTMENTS TABLE
      ====================================================== */}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-muted py-3">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-muted py-3">
              No appointments available yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    {/* ADMIN sees patient */}
                    {(isAdmin || isDoctor || isPatient) && <th>Patient</th>}

                    {/* Everyone sees doctor */}
                    <th>Doctor</th>

                    <th>Date</th>

                    <th>Status</th>

                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      {/* ------------------------------------------------
                          PATIENT NAME
                          ------------------------------------------------ */}

                      <td className="fw-semibold">
                        {appointment.patient_name || "—"}
                      </td>

                      {/* ------------------------------------------------
                          DOCTOR NAME
                          ------------------------------------------------ */}

                      <td>{appointment.doctor_name || "—"}</td>

                      {/* ------------------------------------------------
                          DATE
                          ------------------------------------------------ */}

                      <td>{formatDate(appointment.appointment_date)}</td>

                      {/* ------------------------------------------------
                          STATUS
                          ------------------------------------------------ */}

                      <td>
                        {/* ----------------------------------------------
                            DOCTOR STATUS CONTROL
                            ---------------------------------------------- */}

                        {isDoctor ? (
                          <select
                            className={`form-select form-select-sm ${
                              appointment.status === "CANCELLED"
                                ? "border-danger"
                                : ""
                            }`}
                            value={appointment.status || "PENDING"}
                            onChange={(e) =>
                              handleStatusChange(appointment.id, e.target.value)
                            }
                            style={{
                              maxWidth: "150px",
                            }}
                          >
                            <option value="PENDING">Pending</option>

                            <option value="CONFIRMED">Confirmed</option>

                            <option value="COMPLETED">Completed</option>

                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        ) : (
                          <span
                            className={`badge ${getStatusBadgeClass(
                              appointment.status,
                            )}`}
                          >
                            {appointment.status || "PENDING"}
                          </span>
                        )}
                      </td>

                      {/* ------------------------------------------------
                          ACTIONS
                          ------------------------------------------------ */}

                      <td className="text-end">
                        {/* ----------------------------------------------
                            ADMIN ACTIONS
                            ---------------------------------------------- */}

                        {isAdmin && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(appointment)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(appointment.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {/* ----------------------------------------------
                            DOCTOR
                            ---------------------------------------------- */}

                        {isDoctor && (
                          <span className="text-muted">Status management</span>
                        )}

                        {/* ----------------------------------------------
                            PATIENT
                            ---------------------------------------------- */}

                        {isPatient && (
                          <span className="text-muted">View only</span>
                        )}
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
  );
}

export default Appointments;
