import { useEffect, useState } from "react";
import {
  getRecoveryProgress,
  createRecoveryProgress,
  updateRecoveryProgress,
} from "../../services/recoveryProgressService";
import { useAuth } from "../../contexts/AuthContext";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

function RecoveryProgress() {
  const { profile } = useAuth();

  const [progressEntries, setProgressEntries] = useState([]);

  // Fields a PATIENT fills in when logging a new recovery entry.
  // Kept entirely separate from reviewData below since patients and
  // doctors/admins never edit the same fields — this avoids one
  // shared object where half the keys are irrelevant depending on
  // who's using the form.
  const [formData, setFormData] = useState({
    visit: "",
    pain_level: "",
    body_temperature: "",
    feeling_better: false,
    notes: "",
    improvement_percentage: "",
  });

  // Fields a DOCTOR/ADMIN fills in when reviewing an existing entry.
  // Only ever touched via handleReviewChange / handleReviewSubmit.
  const [reviewData, setReviewData] = useState({
    is_reviewed: false,
    doctor_response: "",
  });

  // Set only when a doctor/admin opens an entry to review it (see
  // handleReview). Patients never set this — creating a new entry is
  // their only action, there's no patient-side "edit" flow here.
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const role = profile?.role?.toUpperCase();

  const isPatient = role === "PATIENT";
  const isDoctor = role === "DOCTOR";
  const isAdmin = role === "ADMIN";

  const canReview = isDoctor || isAdmin;
  const canCreate = isPatient;

  useEffect(() => {
    // Unlike some of the other pages in this app, this doesn't wait
    // for `profile`/`role` to resolve first — it loads immediately
    // on mount. getRecoveryProgress() presumably still works
    // correctly even before role is known, since the backend does
    // its own filtering by authenticated user regardless.
    loadRecoveryProgress();
  }, []);

  const loadRecoveryProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRecoveryProgress();

      console.log("RECOVERY PROGRESS API RESPONSE:", data);

      setProgressEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load recovery progress:", error);

      setError(getFriendlyErrorMessage(error, "Unable to load recovery progress. Please check your connection and try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Generic handler for the patient-facing create form. Handles
    // both text/number inputs (via value) and the "feeling_better"
    // checkbox (via checked).
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReviewChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Same pattern as handleChange above, but scoped to reviewData
    // instead — kept as a separate function specifically so a
    // doctor/admin's review inputs can never accidentally write into
    // the patient's formData (or vice versa).
    setReviewData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    // Resets BOTH formData and reviewData together, since only one
    // of the two forms is ever visible at a time (see canCreate vs
    // canReview + editingId in the render section) — there's no
    // harm in clearing both regardless of which one was in use.
    setFormData({
      visit: "",
      pain_level: "",
      body_temperature: "",
      feeling_better: false,
      notes: "",
      improvement_percentage: "",
    });

    setReviewData({
      is_reviewed: false,
      doctor_response: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      // visit is optional (see "Optional" placeholder on that input),
      // so it's only converted to a Number when actually provided —
      // otherwise explicitly sent as null rather than NaN or "".
      // pain_level/improvement_percentage are required numeric
      // fields, so they're always coerced directly.
      const data = {
        visit: formData.visit ? Number(formData.visit) : null,
        pain_level: Number(formData.pain_level),
        body_temperature: formData.body_temperature || null,
        feeling_better: formData.feeling_better,
        notes: formData.notes,
        improvement_percentage: Number(formData.improvement_percentage),
      };

      await createRecoveryProgress(data);

      await loadRecoveryProgress();

      resetForm();
    } catch (error) {
      console.error("Unable to save recovery progress:", error);

      setError(
        getFriendlyErrorMessage(
          error,
          "Unable to save recovery progress. Please check your recovery details and try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReview = (entry) => {
    // No role guard here (unlike handleEdit/handleDelete in the
    // Visits/Treatment pages) — this relies entirely on the "Review"
    // button only being rendered when canReview is true (see the
    // table's Actions column below).
    setEditingId(entry.id);

    setReviewData({
      is_reviewed: entry.is_reviewed || false,
      doctor_response: entry.doctor_response || "",
    });

    setShowForm(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // Safety check: this form should never be reachable without
    // editingId set (see the `showForm && canReview && editingId`
    // guard on the review form below), but bail out cleanly if it
    // somehow is.
    if (!editingId) return;

    try {
      setSaving(true);
      setError("");

      const data = {
        is_reviewed: reviewData.is_reviewed,
        doctor_response: reviewData.doctor_response,
      };

      await updateRecoveryProgress(editingId, data);

      await loadRecoveryProgress();

      resetForm();
    } catch (error) {
      console.error("Unable to review recovery progress:", error);

      setError(
        getFriendlyErrorMessage(
          error,
          "Unable to update recovery review. Please check your review notes and try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const getPatientName = (entry) => {
    // The `patient` field on an entry can apparently arrive in
    // several different shapes depending on how the backend
    // serializes it (a raw string, a nested object with different
    // possible name fields, or a nested user object) — this walks
    // through each possibility in order of preference before
    // falling back to just the patient's id, or "Unknown" if nothing
    // is present at all.
    if (!entry.patient) return "Unknown";

    if (typeof entry.patient === "string") {
      return entry.patient;
    }

    if (entry.patient.full_name) {
      return entry.patient.full_name;
    }

    if (entry.patient.name) {
      return entry.patient.name;
    }

    if (entry.patient.user?.first_name || entry.patient.user?.last_name) {
      return `${entry.patient.user?.first_name || ""} ${
        entry.patient.user?.last_name || ""
      }`.trim();
    }

    return entry.patient.id || "Unknown";
  };

  return (
    <div className="container-fluid py-4">
      {/* ================================
          PAGE HEADER
      ================================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Recovery Progress</h2>

          <p className="text-muted mb-0">
            {isPatient
              ? "Track your recovery and treatment progress."
              : "Monitor and review patient recovery progress."}
          </p>
        </div>

        {canCreate && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Progress
          </button>
        )}
      </div>

      {/* ================================
          ERROR
      ================================= */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* ================================
          PATIENT CREATE FORM

          Note the `!editingId` check here: this form and the
          doctor/admin review form below are mutually exclusive
          purely by these two conditions (canCreate vs canReview +
          editingId) — a patient could theoretically never have
          editingId set, but the extra check makes the intent
          explicit and future-proofs against that assumption
          changing.
      ================================= */}
      {showForm && canCreate && !editingId && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-4">
              Add Recovery Progress
            </h5>

            <form onSubmit={handlePatientSubmit}>
              <div className="row">
                {/* Visit */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Visit ID</label>

                  <input
                    type="number"
                    name="visit"
                    className="form-control"
                    value={formData.visit}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                {/* Pain */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Pain Level</label>

                  <input
                    type="number"
                    name="pain_level"
                    className="form-control"
                    min="0"
                    value={formData.pain_level}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Temperature */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Body Temperature
                  </label>

                  <input
                    type="text"
                    name="body_temperature"
                    className="form-control"
                    placeholder="e.g. 36.8"
                    value={formData.body_temperature}
                    onChange={handleChange}
                  />
                </div>

                {/* Improvement */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Improvement Percentage
                  </label>

                  <input
                    type="number"
                    name="improvement_percentage"
                    className="form-control"
                    min="0"
                    max="100"
                    value={formData.improvement_percentage}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Feeling better */}
                <div className="col-12 mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="feeling_better"
                      className="form-check-input"
                      checked={formData.feeling_better}
                      onChange={handleChange}
                      id="feelingBetter"
                    />

                    <label
                      className="form-check-label"
                      htmlFor="feelingBetter"
                    >
                      I am feeling better
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="col-12 mb-3">
                  <label className="form-label">Notes</label>

                  <textarea
                    name="notes"
                    className="form-control"
                    rows="4"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Describe how you are feeling..."
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Progress"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================
          DOCTOR / ADMIN REVIEW FORM

          Deliberately styled with `border-primary` to visually set
          it apart from the plain patient create form above — a
          small cue that this is a different kind of action
          (reviewing someone else's data vs logging your own).
      ================================= */}
      {showForm && canReview && editingId && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="card-title mb-1">
                  Review Recovery Progress
                </h5>

                <p className="text-muted mb-0">
                  Review the patient's submitted recovery information.
                </p>
              </div>

              <span className="badge bg-primary">
                Recovery #{editingId}
              </span>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Doctor Response
                </label>

                <textarea
                  name="doctor_response"
                  className="form-control"
                  rows="5"
                  value={reviewData.doctor_response}
                  onChange={handleReviewChange}
                  placeholder="Enter your response to the patient..."
                />
              </div>

              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  name="is_reviewed"
                  className="form-check-input"
                  id="isReviewed"
                  checked={reviewData.is_reviewed}
                  onChange={handleReviewChange}
                />

                <label
                  className="form-check-label fw-semibold"
                  htmlFor="isReviewed"
                >
                  Mark this recovery progress as reviewed
                </label>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Review"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================
          RECOVERY PROGRESS TABLE
      ================================= */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">
              Recovery Progress Records
            </h5>

            <span className="badge bg-light text-dark">
              {progressEntries.length} record
              {progressEntries.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border"></div>

              <p className="text-muted mt-3 mb-0">
                Loading recovery progress...
              </p>
            </div>
          ) : progressEntries.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-clipboard2-pulse fs-1 d-block mb-3"></i>

              <p className="mb-0">
                No recovery progress records found.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    {/* Patient column hidden for patients themselves
                        — same reasoning as the other role-scoped
                        tables in this app: they already know every
                        row is theirs. */}
                    {!isPatient && <th>Patient</th>}

                    <th>Visit</th>
                    <th>Pain</th>
                    <th>Temperature</th>
                    <th>Feeling Better</th>
                    <th>Improvement</th>
                    <th>Review Status</th>
                    <th>Recorded At</th>

                    {canReview && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {progressEntries.map((entry) => (
                    <tr key={entry.id}>
                      {!isPatient && (
                        <td>
                          <span className="fw-semibold">
                            {getPatientName(entry)}
                          </span>
                        </td>
                      )}

                      <td>{entry.visit || "-"}</td>

                      <td>
                        <span className="fw-semibold">
                          {entry.pain_level ?? "-"}
                        </span>
                      </td>

                      <td>
                        {entry.body_temperature || "-"}
                      </td>

                      <td>
                        {entry.feeling_better ? (
                          <span className="badge bg-success">
                            Yes
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            No
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="fw-semibold">
                          {entry.improvement_percentage ?? 0}%
                        </span>
                      </td>

                      <td>
                        {entry.is_reviewed ? (
                          <span className="badge bg-success">
                            Reviewed
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            Pending Review
                          </span>
                        )}
                      </td>

                      <td>
                        {entry.recorded_at
                          ? new Date(
                              entry.recorded_at,
                            ).toLocaleString()
                          : "-"}
                      </td>

                      {canReview && (
                        <td>
                          {/* Button styling/label/icon all flip
                              based on whether this entry has already
                              been reviewed: a solid "Review" button
                              for pending entries (draws attention to
                              what still needs action), vs an outline
                              "Edit Review" button for ones already
                              handled (lower visual priority, but
                              still editable). */}
                          <button
                            className={`btn btn-sm ${
                              entry.is_reviewed
                                ? "btn-outline-primary"
                                : "btn-primary"
                            }`}
                            onClick={() => handleReview(entry)}
                          >
                            <i
                              className={`bi ${
                                entry.is_reviewed
                                  ? "bi-pencil-square"
                                  : "bi-check2-circle"
                              } me-1`}
                            ></i>

                            {entry.is_reviewed
                              ? "Edit Review"
                              : "Review"}
                          </button>
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

export default RecoveryProgress;