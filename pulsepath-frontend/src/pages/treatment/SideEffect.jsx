import { useEffect, useState } from "react";
import {
  getSideEffects,
  createSideEffect,
  updateSideEffect,
  deleteSideEffect,
} from "../../services/sideEffectService";
import { useAuth } from "../../contexts/AuthContext";

function SideEffect() {
  const { profile } = useAuth();

  // Store side effect reports returned by the API.
  const [sideEffects, setSideEffects] = useState([]);

  // Store form data when creating or editing a report.
  const [formData, setFormData] = useState({
    patient: "",
    prescription: "",
    medication: "",
    severity: "Mild",
    description: "",
    is_reviewed: false,
    doctor_response: "",
  });

  // Keep track of whether we are editing an existing report.
  const [editingId, setEditingId] = useState(null);

  // Loading and error states.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Control form visibility.
  const [showForm, setShowForm] = useState(false);

  // Determine the user's role.
  const role = profile?.role?.toUpperCase();

  // Doctors and admins can manage reports.
  const canManage = role === "ADMIN" || role === "DOCTOR";

  // Patients can submit reports.
  const canReport = role === "PATIENT" || canManage;

  // Load side effect reports when the page opens.
  useEffect(() => {
    loadSideEffects();
  }, []);

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

  // Update form fields.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Clear the form.
  const resetForm = () => {
    setFormData({
      patient: "",
      prescription: "",
      medication: "",
      severity: "Mild",
      description: "",
      is_reviewed: false,
      doctor_response: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Create or update a side effect report.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        patient: Number(formData.patient),
        prescription: Number(formData.prescription),
        medication: Number(formData.medication),
        severity: formData.severity,
        description: formData.description,
        is_reviewed: formData.is_reviewed,
        doctor_response: formData.doctor_response,
      };

      if (editingId) {
        await updateSideEffect(editingId, payload);
      } else {
        await createSideEffect(payload);
      }

      await loadSideEffects();
      resetForm();
    } catch (error) {
      console.error("Unable to save side effect:", error);
      setError("Unable to save side effect report.");
    }
  };

  // Prepare a report for editing.
  const handleEdit = (sideEffect) => {
    setEditingId(sideEffect.id);

    setFormData({
      patient: sideEffect.patient || "",
      prescription: sideEffect.prescription || "",
      medication: sideEffect.medication || "",
      severity: sideEffect.severity || "Mild",
      description: sideEffect.description || "",
      is_reviewed: sideEffect.is_reviewed ?? false,
      doctor_response: sideEffect.doctor_response || "",
    });

    setShowForm(true);
  };

  // Delete a side effect report.
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this side effect report?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteSideEffect(id);

      await loadSideEffects();
    } catch (error) {
      console.error("Unable to delete side effect:", error);
      setError("Unable to delete side effect report.");
    }
  };

  // Severity badge.
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

  return (
    <div className="container-fluid py-4">

      {/* Page heading */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Side Effect Reports
          </h2>

          <p className="text-muted mb-0">
            Report and monitor medication side effects.
          </p>
        </div>

        {/* Patients, doctors and admins can report */}
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

      {/* API errors */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Side effect form */}
      {showForm && canReport && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">

            <h5 className="card-title mb-4">
              {editingId
                ? "Edit Side Effect Report"
                : "Report Side Effect"}
            </h5>

            <form onSubmit={handleSubmit}>

              <div className="row">

                {/* Patient */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Patient ID
                  </label>

                  <input
                    type="number"
                    name="patient"
                    className="form-control"
                    placeholder="Enter patient ID"
                    value={formData.patient}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>

                {/* Prescription */}
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

                {/* Medication */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Medication ID
                  </label>

                  <input
                    type="number"
                    name="medication"
                    className="form-control"
                    placeholder="Enter medication ID"
                    value={formData.medication}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>

                {/* Severity */}
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

                {/* Description */}
                <div className="col-12 mb-3">
                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Describe the side effect..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Doctor response */}
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

                {/* Reviewed */}
                <div className="col-12 mb-3">
                  <div className="form-check">

                    <input
                      type="checkbox"
                      name="is_reviewed"
                      className="form-check-input"
                      id="isReviewed"
                      checked={formData.is_reviewed}
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

              </div>

              {/* Form buttons */}
              <div className="d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingId
                    ? "Update Report"
                    : "Save Report"}
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

      {/* Side effect table */}
      <div className="card shadow-sm">
        <div className="card-body">

          <h5 className="card-title mb-3">
            Side Effect Reports
          </h5>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border"></div>
            </div>
          ) : sideEffects.length === 0 ? (
            <div className="text-center text-muted py-4">
              No side effect reports found.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Prescription</th>
                    <th>Medication</th>
                    <th>Severity</th>
                    <th>Description</th>
                    <th>Reviewed</th>
                    <th>Doctor Response</th>
                    <th>Reported At</th>

                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {sideEffects.map((sideEffect) => (
                    <tr key={sideEffect.id}>

                      <td>
                        <span className="fw-semibold">
                          Patient #{sideEffect.patient}
                        </span>
                      </td>

                      <td>
                        Prescription #{sideEffect.prescription}
                      </td>

                      <td>
                        Medication #{sideEffect.medication}
                      </td>

                      <td>
                        {getSeverityBadge(
                          sideEffect.severity
                        )}
                      </td>

                      <td>
                        {sideEffect.description || "-"}
                      </td>

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

                      <td>
                        {sideEffect.doctor_response || "-"}
                      </td>

                      <td>
                        {sideEffect.reported_at
                          ? new Date(
                              sideEffect.reported_at
                            ).toLocaleString()
                          : "-"}
                      </td>

                      {canManage && (
                        <td>
                          <div className="d-flex gap-2">

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleEdit(sideEffect)
                              }
                            >
                              Edit
                            </button>

                            <button
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