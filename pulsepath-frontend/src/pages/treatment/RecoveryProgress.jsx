import { useEffect, useState } from "react";
import {
  getRecoveryProgress,
  createRecoveryProgress,
  updateRecoveryProgress,
  deleteRecoveryProgress,
} from "../../services/recoveryProgressService";
import { useAuth } from "../../contexts/AuthContext";

function RecoveryProgress() {
  const { profile } = useAuth();

  const [progressEntries, setProgressEntries] = useState([]);

  const [formData, setFormData] = useState({
    
    visit: "",
    pain_level: "",
    body_temperature: "",
    feeling_better: false,
    notes: "",
    improvement_percentage: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
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

      setError("Unable to load recovery progress.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      visit: "",
      pain_level: "",
      body_temperature: "",
      feeling_better: false,
      notes: "",
      improvement_percentage: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const data = {
        visit: formData.visit ? Number(formData.visit) : null,
        pain_level: Number(formData.pain_level),
        body_temperature: formData.body_temperature || null,
        feeling_better: formData.feeling_better,
        notes: formData.notes,
        improvement_percentage: Number(formData.improvement_percentage),
      };

      if (editingId) {
        await updateRecoveryProgress(editingId, data);
      } else {
        await createRecoveryProgress(data);
      }

      await loadRecoveryProgress();

      resetForm();
    } catch (error) {
      console.error("Unable to save recovery progress:", error);

      setError("Unable to save recovery progress.");
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);

    setFormData({
      
      visit: entry.visit || "",
      pain_level: entry.pain_level ?? "",
      body_temperature: entry.body_temperature || "",
      feeling_better: entry.feeling_better || false,
      notes: entry.notes || "",
      improvement_percentage: entry.improvement_percentage ?? "",
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recovery progress entry?",
    );

    if (!confirmed) return;

    try {
      await deleteRecoveryProgress(id);

      await loadRecoveryProgress();
    } catch (error) {
      console.error("Unable to delete recovery progress:", error);

      setError("Unable to delete recovery progress.");
    }
  };

  const role = profile?.role?.toUpperCase();

  const canManage = role === "ADMIN" || role === "DOCTOR";

  const canAddProgress =
    role === "ADMIN" || role === "DOCTOR" || role === "PATIENT";

  return (
    <div className="container-fluid py-4">
      {/* Page heading */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Recovery Progress</h2>

          <p className="text-muted mb-0">
            Monitor patient recovery and treatment progress.
          </p>
        </div>

        {canAddProgress && (
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

      {/* Error */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Form */}
      {showForm && canAddProgress && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-4">
              {editingId ? "Edit Recovery Progress" : "Add Recovery Progress"}
            </h5>

            <form onSubmit={handleSubmit}>
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
                  />
                </div>
                {/* Pain */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Pain Level</label>

                  <input
                    type="number"
                    name="pain_level"
                    className="form-control"
                    value={formData.pain_level}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Temperature */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Body Temperature</label>

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
                <div className="col-md-4 mb-3">
                  <label className="form-label">Improvement %</label>

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

                    <label className="form-check-label" htmlFor="feelingBetter">
                      Feeling better?
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="col-12 mb-3">
                  <label className="form-label">Notes</label>

                  <textarea
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Progress" : "Save Progress"}
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

      {/* Progress table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Recovery Progress Records</h5>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border"></div>
            </div>
          ) : progressEntries.length === 0 ? (
            <div className="text-center text-muted py-4">
              No recovery progress records found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Visit</th>
                    <th>Pain Level</th>
                    <th>Temperature</th>
                    <th>Feeling Better</th>
                    <th>Improvement</th>
                    <th>Recorded At</th>

                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {progressEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.patient}</td>

                      <td>{entry.visit}</td>

                      <td>{entry.pain_level}</td>

                      <td>{entry.body_temperature || "-"}</td>

                      <td>
                        {entry.feeling_better ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-secondary">No</span>
                        )}
                      </td>

                      <td>{entry.improvement_percentage}%</td>

                      <td>
                        {entry.recorded_at
                          ? new Date(entry.recorded_at).toLocaleString()
                          : "-"}
                      </td>

                      {canManage && (
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(entry)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(entry.id)}
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

export default RecoveryProgress;
