import { useEffect, useState } from "react";
import {
  createVisit,
  deleteVisit,
  getVisits,
  updateVisit,
} from "../../services/visitService";
import { getAppointments } from "../../services/AppointmentService";
import { useAuth } from "../../contexts/AuthContext";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

// Shape of a fresh/blank visit form. Reused both for the initial
// state and whenever the form is reset after a create/update/cancel.
const initialFormState = {
  appointment: "",
  patient: "",
  reason: "",
  symptoms: "",
  diagnosis: "",
  notes: "",
};

function Visits() {
  // =========================================================
  // AUTHENTICATION / ROLE
  // =========================================================

  const { profile } = useAuth();

  const role = profile?.role;

  // These three booleans drive almost every conditional in this
  // component (what data loads, what buttons render, what actions
  // are allowed). Deriving them once here keeps the JSX below
  // readable instead of repeating `role === "..."` everywhere.
  const isPatient = role === "PATIENT";
  const isDoctor = role === "DOCTOR";
  const isAdmin = role === "ADMIN";

  // =========================================================
  // STATE
  // =========================================================

  const [visits, setVisits] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  // Stores the ID when ADMIN or DOCTOR is editing a visit.
  // null = "creating a new visit"; a real ID = "editing that visit".
  // handleSubmit branches on this to decide create vs update.
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(initialFormState);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    // Wait until AuthContext has actually resolved a profile before
    // loading anything — otherwise isDoctor/isAdmin/isPatient would
    // all be false on the very first render and we'd skip loading
    // appointments for a doctor/admin who just hasn't loaded yet.
    if (!profile) return;

    loadData();
  }, [profile]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------------
      // LOAD VISITS
      // -------------------------------------------------------
      //
      // The backend should already filter the visits according
      // to the authenticated user's permissions.
      //

      const visitData = await getVisits();

      setVisits(
        Array.isArray(visitData) ? visitData : []
      );

      // -------------------------------------------------------
      // LOAD APPOINTMENTS
      // -------------------------------------------------------
      //
      // Doctors and Admins need appointments when creating
      // a visit.
      //
      // Patients don't get appointments loaded at all here, since
      // they can't create/edit visits (see the isDoctor/isAdmin
      // guards further down) and so never need this list.
      if (isDoctor || isAdmin) {
        const appointmentData = await getAppointments();

        setAppointments(
          Array.isArray(appointmentData)
            ? appointmentData
            : []
        );
      }
    } catch (err) {
      console.error("VISITS LOAD ERROR:", err);

      setError(getFriendlyErrorMessage(err, "Unable to load visits. Please check your connection and try again."));
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORM INPUT HANDLER
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Generic update: works for every field by name (reason,
    // symptoms, diagnosis, notes, and also appointment before the
    // special-case below overrides it).
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // ---------------------------------------------------------
    // WHEN AN APPOINTMENT IS SELECTED
    // ---------------------------------------------------------
    //
    // The appointment already belongs to a patient.
    //
    // Therefore, we automatically set the patient ID instead
    // of allowing the user to select a different patient.
    //
    // Note: this runs as a SECOND setFormData call right after the
    // generic one above. React batches these, so the end result is
    // just the second update "winning" for the `appointment` key —
    // it re-sets `appointment` (redundant but harmless) and adds
    // `patient` in the same pass. This is why there isn't a separate
    // patient <select> in the form: patient is always derived from
    // whichever appointment was chosen, never picked independently.
    if (name === "appointment") {
      const selectedAppointment = appointments.find(
        (appointment) =>
          String(appointment.id) === String(value)
      );

      setFormData((previous) => ({
        ...previous,
        appointment: value,
        patient: selectedAppointment?.patient || "",
      }));
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(false);
  };

  // =========================================================
  // CREATE / UPDATE VISIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------
    // Checked in order of dependency: an appointment must be picked
    // before a patient can exist, and a patient must be resolved
    // before the visit is meaningful. `reason` is the one genuinely
    // free-typed required field.

    if (!formData.appointment) {
      setError("Please select an appointment.");
      return;
    }

    if (!formData.patient) {
      // This shouldn't normally happen since patient is auto-derived
      // in handleChange above — it's a safety net in case an
      // appointment somehow has no associated patient field.
      setError(
        "Unable to determine the patient from the selected appointment."
      );
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please enter the reason for the visit.");
      return;
    }

    try {
      setSaving(true);

      // -------------------------------------------------------
      // VISIT PAYLOAD
      // -------------------------------------------------------
      //
      // This matches your backend POST schema:
      //
      // {
      //   appointment: 0,
      //   patient: 0,
      //   reason: "...",
      //   symptoms: "...",
      //   diagnosis: "...",
      //   notes: "..."
      // }
      //
      // appointment/patient are cast to Number() because the <select>
      // and form state store them as strings (HTML form values are
      // always strings), but the backend expects numeric FK ids.

      const payload = {
        appointment: Number(formData.appointment),
        patient: Number(formData.patient),
        reason: formData.reason,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
      };

      // -------------------------------------------------------
      // UPDATE EXISTING VISIT
      // -------------------------------------------------------
      // editingId is only ever set by handleEdit, so reaching this
      // branch means the user opened the form via "Edit" on an
      // existing row rather than "+ New Visit".

      if (editingId) {
        await updateVisit(editingId, payload);

        setSuccess("Visit updated successfully.");

        resetForm();

        // Re-fetch from the server rather than patching local state
        // directly, so the table reflects whatever the backend
        // actually stored (including any server-side computed
        // fields like patient_name).
        await loadData();

        return;
      }

      // -------------------------------------------------------
      // CREATE NEW VISIT
      // -------------------------------------------------------

      await createVisit(payload);

      setSuccess("Visit created successfully.");

      resetForm();

      await loadData();
    } catch (err) {
      console.error("VISIT SAVE ERROR:", err);

      setError(
        getFriendlyErrorMessage(
          err,
          editingId
            ? "Failed to update visit. Please check the appointment and visit details and try again."
            : "Failed to create visit. Please check the appointment and visit details and try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT VISIT
  // =========================================================
  //
  // Both Doctor and Admin can edit according to our frontend
  // role design.
  //

  const handleEdit = (visit) => {
    // Extra guard in addition to the UI already hiding the Edit
    // button for patients — defends against this being called
    // programmatically or the button briefly rendering during a
    // role/profile transition.
    if (!isDoctor && !isAdmin) return;

    setEditingId(visit.id);

    // Pre-fill the form with the existing visit's values so the
    // user is editing, not starting from a blank form. Falls back to
    // "" for any field that's null/undefined on the visit object.
    setFormData({
      appointment: visit.appointment || "",
      patient: visit.patient || "",
      reason: visit.reason || "",
      symptoms: visit.symptoms || "",
      diagnosis: visit.diagnosis || "",
      notes: visit.notes || "",
    });

    setShowForm(true);

    setError("");
    setSuccess("");
  };

  // =========================================================
  // DELETE VISIT
  // =========================================================
  //
  // Only ADMIN gets the delete action in the frontend.
  //

  const handleDelete = async (id) => {
    // Same defense-in-depth pattern as handleEdit: the Delete button
    // is only rendered for admins, but this guard stops the action
    // even if it's triggered some other way.
    if (!isAdmin) return;

    // Native browser confirm dialog — simple but blocks the main
    // thread; fine for a low-frequency destructive action like this.
    const confirmed = window.confirm(
      "Are you sure you want to delete this visit?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteVisit(id);

      setSuccess("Visit deleted successfully.");

      // Re-fetch rather than filtering the deleted visit out of
      // local state, keeping this consistent with how create/update
      // refresh from the server above.
      await loadData();
    } catch (err) {
      console.error("DELETE VISIT ERROR:", err);

      setError(getFriendlyErrorMessage(err, "Unable to delete this visit. It may be linked to clinical records."));
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    // Guards against unparsable date strings (e.g. malformed backend
    // data) — rather than showing "Invalid Date", fall back to
    // whatever raw value was passed in.
    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    // `undefined` locale = use the browser's own locale settings,
    // so dates render in whatever format/timezone convention the
    // user's device is already set to.
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  // =========================================================
  // PAGE TEXT
  // =========================================================

  // Same page, different copy depending on whether the viewer is a
  // patient (their own history) or staff (managing many patients'
  // visits).
  const pageTitle = isPatient
    ? "My Visits"
    : "Visits";

  const pageDescription = isPatient
    ? "View your medical visit history."
    : "View and manage patient visits.";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="container-fluid py-4">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            {pageTitle}
          </h2>

          <p className="text-muted mb-0">
            {pageDescription}
          </p>
        </div>

        {/* ---------------------------------------------------
            ONLY DOCTOR AND ADMIN CAN CREATE VISITS
            --------------------------------------------------- */}

        {(isDoctor || isAdmin) && (
          <button
            className="btn btn-primary"
            onClick={() => {
              // Toggle button: closes (and resets) the form if it's
              // already open, otherwise opens a blank one. Note this
              // button's label already changes below depending on
              // whether an edit is in progress, but clicking it while
              // editing still just calls resetForm (cancels the edit)
              // rather than closing without resetting.
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
              ? "Close Form"
              : editingId
              ? "Edit Visit"
              : "+ New Visit"}
          </button>
        )}
      </div>

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="alert alert-warning">
          {error}
        </div>
      )}

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* =====================================================
          CREATE / EDIT FORM
      ====================================================== */}

      {showForm && (isDoctor || isAdmin) && (
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-4">
              {editingId
                ? "Edit Visit"
                : "Create Visit"}
            </h5>

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                {/* =================================================
                    APPOINTMENT
                ================================================== */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment
                  </label>

                  <select
                    className="form-select"
                    name="appointment"
                    value={formData.appointment}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select an appointment
                    </option>

                    {appointments.map((appointment) => (
                      <option
                        key={appointment.id}
                        value={appointment.id}
                      >
                        {appointment.patient_name ||
                          `Appointment #${appointment.id}`}
                        {" — "}
                        {formatDate(
                          appointment.appointment_date
                        )}
                      </option>
                    ))}
                  </select>

                </div>

                {/* =================================================
                    PATIENT
                    ==================================================
                    
                    Patient is automatically determined from the
                    selected appointment.
                ================================================== */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Patient
                  </label>

                  {/* Disabled, read-only display — this is not a
                      real form input the user edits directly; its
                      only job is to show which patient handleChange
                      resolved from the chosen appointment above. */}
                  <input
                    type="text"
                    className="form-control"
                    value={
                      formData.patient
                        ? `Patient #${formData.patient}`
                        : "Select an appointment first"
                    }
                    disabled
                  />

                  <div className="form-text">
                    Patient is automatically linked to the
                    selected appointment.
                  </div>

                </div>

                {/* =================================================
                    REASON
                ================================================== */}

                <div className="col-12">

                  <label className="form-label fw-semibold">
                    Reason for Visit
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Enter reason for the visit"
                    required
                  />

                </div>

                {/* =================================================
                    SYMPTOMS
                ================================================== */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Symptoms
                  </label>

                  <textarea
                    className="form-control"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the patient's symptoms"
                  />

                </div>

                {/* =================================================
                    DIAGNOSIS
                ================================================== */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Diagnosis
                  </label>

                  <textarea
                    className="form-control"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Enter diagnosis"
                  />

                </div>

                {/* =================================================
                    NOTES
                ================================================== */}

                <div className="col-12">

                  <label className="form-label fw-semibold">
                    Notes
                  </label>

                  <textarea
                    className="form-control"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Additional notes"
                  />

                </div>

              </div>

              {/* =================================================
                  FORM ACTIONS
              ================================================== */}

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
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Create Visit"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          VISITS TABLE
      ====================================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          {loading ? (

            <div className="text-muted py-3">
              Loading visits...
            </div>

          ) : visits.length === 0 ? (

            <div className="text-muted py-3">
              No visits available.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table align-middle mb-0">

                <thead>
                  <tr>

                    <th>Patient</th>
                    <th>Visit Date</th>
                    <th>Reason</th>
                    <th>Diagnosis</th>
                    <th>Actions</th>

                  </tr>
                </thead>

                <tbody>

                  {visits.map((visit) => (

                    <tr key={visit.id}>

                      {/* Patient name comes directly from
                          the Visit API response. */}

                      <td className="fw-semibold">
                        {visit.patient_name || "—"}
                      </td>

                      {/* Visit date */}

                      <td>
                        {formatDate(visit.visit_date)}
                      </td>

                      {/* Reason */}

                      <td>
                        {visit.reason || "—"}
                      </td>

                      {/* Diagnosis */}

                      <td>
                        {visit.diagnosis || "—"}
                      </td>

                      {/* =================================================
                          ACTIONS

                          These three blocks are mutually exclusive in
                          practice per role: a patient only ever sees
                          "View only"; a doctor sees Edit; an admin sees
                          both Edit and Delete. They're not wrapped in a
                          single if/else here, just three independent
                          conditionals guarding each button/label.
                      ================================================== */}

                      <td>

                        {/* ---------------------------------------------
                            DOCTOR + ADMIN
                            --------------------------------------------- */}

                        {(isDoctor || isAdmin) && (
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() =>
                              handleEdit(visit)
                            }
                          >
                            Edit
                          </button>
                        )}

                        {/* ---------------------------------------------
                            ADMIN ONLY
                            --------------------------------------------- */}

                        {isAdmin && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(visit.id)
                            }
                          >
                            Delete
                          </button>
                        )}

                        {/* ---------------------------------------------
                            PATIENT
                            --------------------------------------------- */}

                        {isPatient && (
                          <span className="text-muted">
                            View only
                          </span>
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

export default Visits;