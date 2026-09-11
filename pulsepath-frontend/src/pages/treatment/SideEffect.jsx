import { useEffect, useState } from "react";
import {
  getSideEffects,
  createSideEffect,
  updateSideEffect,
  deleteSideEffect,
} from "../../services/sideEffectService";
import { getMedicationSchedules } from "../../services/medicationScheduleService";
import { useAuth } from "../../contexts/AuthContext";

function SideEffect() {
  const { profile } = useAuth();

  const [sideEffects, setSideEffects] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Shared form state for BOTH flows this page handles:
  // - a patient reporting a new side effect (prescription, severity,
  //   description)
  // - a doctor/admin reviewing an existing report (is_reviewed,
  //   doctor_response)
  // Which fields are actually editable/visible depends on role and
  // whether editingId is set — see the render section further down.
  const [formData, setFormData] = useState({
    prescription: "",
    severity: "Mild",
    description: "",
    is_reviewed: false,
    doctor_response: "",
  });

  // Set when a doctor/admin opens a report to review it. Patients
  // never set this — they only ever create new reports, they don't
  // edit existing ones (see handleSubmit's canReport branch, which
  // ignores editingId entirely).
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  // Normalized to uppercase defensively, in case the backend or
  // token ever returns the role in a different case.
  const role = profile?.role?.toUpperCase();

  const canManage = role === "ADMIN" || role === "DOCTOR";

  // Only patients create/report side effects.
  const canReport = role === "PATIENT";

  // --------------------------------------------------
  // LOAD SIDE EFFECT REPORTS
  // --------------------------------------------------

  const loadSideEffects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSideEffects();

      console.log("SIDE EFFECTS API RESPONSE:", data);

      setSideEffects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load side effects:", error);

      setError("Unable to load side effect reports.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD PATIENT'S ACTIVE MEDICATION SCHEDULES
  // --------------------------------------------------

  const loadSchedules = async () => {
    // Guard here in addition to the useEffect's own role check below
    // — this function is only ever meaningful for patients, since
    // they're the only ones who need a medication dropdown to report
    // against.
    if (role !== "PATIENT") return;

    try {
      setLoadingSchedules(true);

      const data = await getMedicationSchedules();

      console.log("SIDE EFFECT MEDICATION SCHEDULES:", data);

      // Only currently-active schedules make sense to report a side
      // effect against — filter out anything inactive/discontinued.
      const activeSchedules = Array.isArray(data)
        ? data.filter((schedule) => schedule.is_active)
        : [];

      setSchedules(activeSchedules);
    } catch (error) {
      console.error(
        "Unable to load medication schedules:",
        error
      );

      setError(
        "Unable to load your active medications."
      );
    } finally {
      setLoadingSchedules(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    // Wait until the profile (and therefore role) has actually
    // resolved before loading anything, to avoid a flash of
    // incorrect role-based behavior on first render.
    if (!role) return;

    loadSideEffects();

    if (role === "PATIENT") {
      loadSchedules();
    }
  }, [role]);

  // --------------------------------------------------
  // HANDLE FORM CHANGES
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Single handler for every field in the form, including the
    // is_reviewed checkbox — checkboxes report state via `checked`
    // rather than `value`, so branch on input type to pick the right
    // one.
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setFormData({
      prescription: "",
      severity: "Mild",
      description: "",
      is_reviewed: false,
      doctor_response: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // --------------------------------------------------
  // CREATE / REVIEW REPORT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // These two branches are mutually exclusive by role: a
      // patient can never hit the first (canManage is false for
      // them), and a doctor/admin can never hit the second (canReport
      // is false for them). editingId being set is what distinguishes
      // "doctor reviewing an existing report" from any other case.
      if (canManage && editingId) {
        /*
         * Doctors/admins may only update review fields.
         * Nothing else is sent, so the backend never sees
         * an attempted change to patient-owned fields.
         */
        const payload = {
          is_reviewed: formData.is_reviewed,
          doctor_response: formData.doctor_response.trim(),
        };

        await updateSideEffect(editingId, payload);
      } else if (canReport) {
        /*
         * Patients only submit:
         * - prescription
         * - severity
         * - description
         *
         * The backend determines patient and medication.
         */
        const payload = {
          prescription: Number(formData.prescription),
          severity: formData.severity,
          description: formData.description.trim(),
        };

        await createSideEffect(payload);
      }

      await loadSideEffects();

      resetForm();
    } catch (error) {
      console.error(
        "Unable to save side effect:",
        error.response?.data || error
      );

      // DRF validation errors come back keyed by field name (e.g.
      // { prescription: ["This field is required."] }), so check the
      // specific fields this form actually submits before falling
      // back to a generic detail message or a catch-all string.
      const apiError = error.response?.data;

      if (apiError?.detail) {
        setError(apiError.detail);
      } else if (apiError?.prescription) {
        setError(
          Array.isArray(apiError.prescription)
            ? apiError.prescription.join(" ")
            : apiError.prescription
        );
      } else if (apiError?.description) {
        setError(
          Array.isArray(apiError.description)
            ? apiError.description.join(" ")
            : apiError.description
        );
      } else {
        setError(
          "Unable to save side effect report."
        );
      }
    }
  };

  // --------------------------------------------------
  // PREPARE REPORT FOR DOCTOR REVIEW
  // --------------------------------------------------

  const handleReview = (sideEffect) => {
    if (!canManage) return;

    setEditingId(sideEffect.id);

    // Pre-fills the ORIGINAL patient-reported fields too (prescription,
    // severity, description), even though the doctor/admin can't edit
    // them — this is so those values can still be displayed read-only
    // in the form (see the disabled/readOnly inputs further down)
    // without needing a second piece of state just for display.
    setFormData({
      prescription: sideEffect.prescription || "",
      severity: sideEffect.severity || "Mild",
      description: sideEffect.description || "",
      is_reviewed: sideEffect.is_reviewed ?? false,
      doctor_response:
        sideEffect.doctor_response || "",
    });

    setShowForm(true);
  };

  // --------------------------------------------------
  // DELETE REPORT
  // --------------------------------------------------

  const handleDelete = async (id) => {
    if (!canManage) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this side effect report?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteSideEffect(id);

      await loadSideEffects();
    } catch (error) {
      console.error(
        "Unable to delete side effect:",
        error
      );

      setError(
        "Unable to delete side effect report."
      );
    }
  };

  // --------------------------------------------------
  // SEVERITY BADGE
  // --------------------------------------------------

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Mild":
        // Note: Mild and Moderate currently render with the same
        // warning/yellow styling — only Severe is visually
        // distinguished (red/danger). Worth knowing if you ever want
        // Mild vs Moderate to look different at a glance.
        return (
          <span className="badge bg-warning text-dark">
            Mild
          </span>
        );

      case "Moderate":
        return (
          <span className="badge bg-warning text-dark">
            Moderate
          </span>
        );

      case "Severe":
        return (
          <span className="badge bg-danger">
            Severe
          </span>
        );

      default:
        // Covers null/undefined/unexpected severity values so the
        // table never renders a blank badge.
        return (
          <span className="badge bg-secondary">
            {severity || "Unknown"}
          </span>
        );
    }
  };

  // --------------------------------------------------
  // GET MEDICATION DISPLAY NAME
  // --------------------------------------------------

  const getMedicationName = (sideEffect) => {
    // Tries several possible sources in order of preference, since
    // depending on role/context the side effect object and the
    // locally-loaded `schedules` list may or may not carry a
    // human-readable medication name:

    // 1. Backend already included a resolved name directly on the
    //    side effect object — best case, use it as-is.
    if (sideEffect.medication_name) {
      return sideEffect.medication_name;
    }

    // 2. Fall back to cross-referencing the patient's own loaded
    //    schedules (only populated for patients — see loadSchedules
    //    above) by matching prescription id.
    const schedule = schedules.find(
      (item) =>
        Number(item.prescription) ===
        Number(sideEffect.prescription)
    );

    if (schedule?.prescription_details) {
      return schedule.prescription_details;
    }

    // 3. Last resorts: show whatever raw id is available rather than
    //    nothing at all.
    if (sideEffect.medication) {
      return `Medication #${sideEffect.medication}`;
    }

    return "-";
  };

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="container-fluid py-4">

      {/* PAGE HEADING */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Side Effect Reports
          </h2>

          <p className="text-muted mb-0">
            Report and monitor medication side effects.
          </p>
        </div>

        {canReport && (
          <button
            className="btn btn-primary"
            onClick={() => {
              // resetForm() first ensures a stale editingId/previous
              // form values can never leak into a brand-new report
              // (shouldn't happen since patients never set editingId,
              // but keeps this button's behavior self-contained).
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Report Side Effect
          </button>
        )}
      </div>

      {/* API ERROR */}
      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* SIDE EFFECT FORM */}
      {/* --------------------------------------------- */}

      {/* This single form serves two very different purposes
          depending on who's looking at it — see the field-level
          comments below for how each input adapts. */}
      {showForm && (canReport || (canManage && editingId)) && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="card-title mb-1">
                  {canManage && editingId
                    ? "Review Side Effect Report"
                    : "Report Side Effect"}
                </h5>

                {role === "PATIENT" && (
                  <small className="text-muted">
                    Tell us about any unusual reaction or
                    side effect you experienced.
                  </small>
                )}

                {canManage && editingId && (
                  <small className="text-muted">
                    You can mark this report as reviewed and
                    leave a response. The reported details
                    below cannot be changed.
                  </small>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="row">

                {/* ----------------------------------- */}
                {/* PATIENT CREATING: MEDICATION SELECT */}
                {/* ----------------------------------- */}

                {canReport && !editingId && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Medication
                    </label>

                    <select
                      name="prescription"
                      className="form-select"
                      value={formData.prescription}
                      onChange={handleChange}
                      required
                      disabled={loadingSchedules}
                    >
                      <option value="">
                        {loadingSchedules
                          ? "Loading medications..."
                          : "Select medication"}
                      </option>

                      {schedules.map((schedule) => (
                        <option
                          key={schedule.id}
                          value={schedule.prescription}
                        >
                          {schedule.prescription_details ||
                            `Prescription #${schedule.prescription}`}
                        </option>
                      ))}
                    </select>

                    {!loadingSchedules &&
                      schedules.length === 0 && (
                        <small className="text-muted">
                          No active medications are
                          currently available for reporting.
                        </small>
                      )}
                  </div>
                )}

                {/* ----------------------------------- */}
                {/* DOCTOR/ADMIN REVIEW: READ-ONLY DETAILS */}
                {/* ----------------------------------- */}

                {canManage && editingId && (
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Prescription
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={`#${formData.prescription}`}
                      disabled
                      readOnly
                    />
                  </div>
                )}

                {/* ----------------------------------- */}
                {/* SEVERITY */}
                {/* ----------------------------------- */}

                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Severity
                  </label>

                  {/* Same field, two renderings: an editable <select>
                      for the patient creating a report, or a
                      disabled/read-only <input> showing what the
                      patient already reported when a doctor/admin is
                      reviewing it. */}
                  {canReport && !editingId ? (
                    <select
                      name="severity"
                      className="form-select"
                      value={formData.severity}
                      onChange={handleChange}
                      required
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={formData.severity}
                      disabled
                      readOnly
                    />
                  )}
                </div>

                {/* ----------------------------------- */}
                {/* DESCRIPTION */}
                {/* ----------------------------------- */}

                <div className="col-12 mb-3">
                  <label className="form-label">
                    Describe the Side Effect
                  </label>

                  {/* Only required/editable when a patient is
                      creating a NEW report; when a doctor/admin is
                      reviewing (canManage && editingId), this becomes
                      disabled+readOnly so they can read the original
                      description but never alter it — matching the
                      "reported details cannot be changed" notice
                      above. */}
                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Describe any side effect or unusual reaction you experienced..."
                    value={formData.description}
                    onChange={handleChange}
                    required={canReport && !editingId}
                    disabled={canManage && editingId}
                    readOnly={canManage && editingId}
                  />

                  {role === "PATIENT" && !editingId && (
                    <small className="text-muted">
                      Please provide any relevant details
                      about what you experienced.
                    </small>
                  )}
                </div>

                {/* ----------------------------------- */}
                {/* DOCTOR RESPONSE (editable by doctor/admin only) */}
                {/* ----------------------------------- */}

                {canManage && editingId && (
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Doctor Response
                    </label>

                    <textarea
                      name="doctor_response"
                      className="form-control"
                      rows="3"
                      placeholder="Doctor's response or recommendation..."
                      value={formData.doctor_response}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* ----------------------------------- */}
                {/* REVIEWED (editable by doctor/admin only) */}
                {/* ----------------------------------- */}

                {canManage && editingId && (
                  <div className="col-12 mb-3">
                    <div className="form-check">

                      <input
                        type="checkbox"
                        name="is_reviewed"
                        className="form-check-input"
                        id="isReviewed"
                        checked={
                          formData.is_reviewed
                        }
                        onChange={handleChange}
                      />

                      <label
                        className="form-check-label"
                        htmlFor="isReviewed"
                      >
                        Reviewed by Doctor
                      </label>

                    </div>
                  </div>
                )}

              </div>

              {/* FORM BUTTONS */}

              <div className="d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                  // Prevents a patient from submitting a report before
                  // their medication list has finished loading, or
                  // when they have no active medications to report
                  // against at all (submitting would otherwise send
                  // an empty/invalid prescription id).
                  disabled={
                    canReport &&
                    !editingId &&
                    (loadingSchedules || schedules.length === 0)
                  }
                >
                  {canManage && editingId
                    ? "Save Review"
                    : "Submit Report"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* REPORT TABLE */}
      {/* --------------------------------------------- */}

      <div className="card shadow-sm">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="card-title mb-1">
                {role === "PATIENT"
                  ? "My Side-Effect Reports"
                  : "Side Effect Reports"}
              </h5>

              {role === "PATIENT" && (
                <small className="text-muted">
                  View the side effects you have reported
                  and their review status.
                </small>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div
                className="spinner-border"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>
            </div>
          ) : sideEffects.length === 0 ? (
            <div className="text-center text-muted py-4">
              {role === "PATIENT"
                ? "You have not reported any side effects yet."
                : "No side effect reports found."}
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>

                    {/* Patient column only makes sense for
                        doctors/admins viewing multiple patients'
                        reports — a patient already knows these are
                        all theirs. */}
                    {role !== "PATIENT" && (
                      <th>Patient</th>
                    )}

                    <th>Medication</th>
                    <th>Severity</th>
                    <th>Description</th>
                    <th>Reviewed</th>
                    <th>Doctor Response</th>
                    <th>Reported At</th>

                    {canManage && (
                      <th>Actions</th>
                    )}

                  </tr>
                </thead>

                <tbody>

                  {sideEffects.map((sideEffect) => (
                    <tr key={sideEffect.id}>

                      {/* PATIENT - DOCTORS/ADMINS ONLY */}
                      {role !== "PATIENT" && (
                        <td>
                          <span className="fw-semibold">
                            Patient #{sideEffect.patient}
                          </span>
                        </td>
                      )}

                      {/* MEDICATION */}
                      <td>
                        {getMedicationName(sideEffect)}
                      </td>

                      {/* SEVERITY */}
                      <td>
                        {getSeverityBadge(
                          sideEffect.severity
                        )}
                      </td>

                      {/* DESCRIPTION */}
                      <td>
                        {/* Fixed min/max width wrapper keeps long
                            descriptions from either collapsing the
                            column too narrow or stretching the table
                            too wide — text wraps naturally inside
                            this box instead. */}
                        <div
                          style={{
                            minWidth: "220px",
                            maxWidth: "350px",
                            whiteSpace: "normal",
                          }}
                        >
                          {sideEffect.description ||
                            "-"}
                        </div>
                      </td>

                      {/* REVIEW STATUS */}
                      <td>
                        {sideEffect.is_reviewed ? (
                          <span className="badge bg-success">
                            Reviewed
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* DOCTOR RESPONSE */}
                      <td>
                        <div
                          style={{
                            minWidth: "200px",
                            maxWidth: "300px",
                            whiteSpace: "normal",
                          }}
                        >
                          {sideEffect.doctor_response ||
                            "-"}
                        </div>
                      </td>

                      {/* REPORTED AT */}
                      <td>
                        {sideEffect.reported_at
                          ? new Date(
                              sideEffect.reported_at
                            ).toLocaleString()
                          : "-"}
                      </td>

                      {/* ACTIONS */}
                      {canManage && (
                        <td>
                          <div className="d-flex gap-2">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleReview(
                                  sideEffect
                                )
                              }
                            >
                              Review
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(
                                  sideEffect.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>
                        </td>
                      )}

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

export default SideEffect;