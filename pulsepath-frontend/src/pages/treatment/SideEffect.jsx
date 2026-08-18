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

  const [formData, setFormData] = useState({
    prescription: "",
    severity: "Mild",
    description: "",
    is_reviewed: false,
    doctor_response: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const role = profile?.role?.toUpperCase();

  const canManage = role === "ADMIN" || role === "DOCTOR";
  const canReport = role === "PATIENT" || canManage;

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
    if (role !== "PATIENT") return;

    try {
      setLoadingSchedules(true);

      const data = await getMedicationSchedules();

      console.log("SIDE EFFECT MEDICATION SCHEDULES:", data);

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
  // CREATE / UPDATE REPORT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      /*
       * Patients only submit:
       * - prescription
       * - severity
       * - description
       *
       * The backend determines:
       * - patient
       * - medication
       */
      const payload = {
        prescription: Number(formData.prescription),
        severity: formData.severity,
        description: formData.description.trim(),
      };

      /*
       * Only doctors/admins can update review information.
       */
      if (canManage && editingId) {
        payload.is_reviewed = formData.is_reviewed;
        payload.doctor_response =
          formData.doctor_response.trim();
      }

      if (editingId) {
        await updateSideEffect(editingId, payload);
      } else {
        await createSideEffect(payload);
      }

      await loadSideEffects();

      resetForm();
    } catch (error) {
      console.error(
        "Unable to save side effect:",
        error.response?.data || error
      );

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
  // PREPARE REPORT FOR EDITING
  // --------------------------------------------------

  const handleEdit = (sideEffect) => {
    if (!canManage) return;

    setEditingId(sideEffect.id);

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
    if (sideEffect.medication_name) {
      return sideEffect.medication_name;
    }

    const schedule = schedules.find(
      (item) =>
        Number(item.prescription) ===
        Number(sideEffect.prescription)
    );

    if (schedule?.prescription_details) {
      return schedule.prescription_details;
    }

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

      {showForm && canReport && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="card-title mb-1">
                  {editingId
                    ? "Edit Side Effect Report"
                    : "Report Side Effect"}
                </h5>

                {role === "PATIENT" && (
                  <small className="text-muted">
                    Tell us about any unusual reaction or
                    side effect you experienced.
                  </small>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="row">

                {/* ----------------------------------- */}
                {/* PATIENT MEDICATION */}
                {/* ----------------------------------- */}

                {role === "PATIENT" ? (
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
                      disabled={
                        loadingSchedules ||
                        Boolean(editingId)
                      }
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
                ) : (
                  /* --------------------------------- */
                  /* DOCTOR / ADMIN PRESCRIPTION */
                  /* --------------------------------- */

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      Prescription ID
                    </label>

                    <input
                      type="number"
                      name="prescription"
                      className="form-control"
                      placeholder="Enter prescription ID"
                      value={formData.prescription}
                      onChange={handleChange}
                      required
                      min="1"
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

                  <select
                    name="severity"
                    className="form-select"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                  >
                    <option value="Mild">
                      Mild
                    </option>

                    <option value="Moderate">
                      Moderate
                    </option>

                    <option value="Severe">
                      Severe
                    </option>
                  </select>
                </div>

                {/* ----------------------------------- */}
                {/* DESCRIPTION */}
                {/* ----------------------------------- */}

                <div className="col-12 mb-3">
                  <label className="form-label">
                    Describe the Side Effect
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Describe any side effect or unusual reaction you experienced..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />

                  {role === "PATIENT" && (
                    <small className="text-muted">
                      Please provide any relevant details
                      about what you experienced.
                    </small>
                  )}
                </div>

                {/* ----------------------------------- */}
                {/* DOCTOR RESPONSE */}
                {/* ----------------------------------- */}

                {canManage && (
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
                {/* REVIEWED */}
                {/* ----------------------------------- */}

                {canManage && (
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
                  disabled={
                    role === "PATIENT" &&
                    (loadingSchedules ||
                      schedules.length === 0)
                  }
                >
                  {editingId
                    ? "Update Report"
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
                                handleEdit(
                                  sideEffect
                                )
                              }
                            >
                              Edit
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