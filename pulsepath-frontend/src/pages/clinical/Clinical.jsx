import { useEffect, useState } from "react";
import { FaFileMedical, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import {
  getClinicalRecords,
  createClinicalRecord,
  updateClinicalRecord,
  deleteClinicalRecord,
} from "../../services/ClinicalService";
import { getVisits } from "../../services/visitService";
import { useAuth } from "../../contexts/AuthContext";

const initialFormState = {
  visit: "",
  allergies: "",
  chronic_conditions: "",
  current_medications: "",
  family_history: "",
  medical_notes: "",
};

/**
 * Clinical record management for DOCTOR and ADMIN.
 *
 * Only one clinical record is allowed per visit (enforced by the
 * backend's validate_visit), so the "select a visit" dropdown filters
 * out visits that already have a record attached, to avoid a
 * confusing validation error after submit.
 *
 * Patients should keep using the existing read-only MedicalRecords
 * page instead of this component.
 */
function ClinicalRecords() {
  const { profile } = useAuth();
  const role = profile?.role;

  const isDoctor = role === "DOCTOR";
  const isAdmin = role === "ADMIN";
  const canManage = isDoctor || isAdmin;

  const [records, setRecords] = useState([]);
  const [visits, setVisits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(initialFormState);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!profile) return;
    loadData();
  }, [profile]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const recordsResponse = await getClinicalRecords();
      const recordList = recordsResponse?.data?.results
        ?? recordsResponse?.results
        ?? (Array.isArray(recordsResponse) ? recordsResponse : []);

      setRecords(recordList);

      if (canManage) {
        const visitData = await getVisits();
        setVisits(Array.isArray(visitData) ? visitData : []);
      }
    } catch (err) {
      console.error("CLINICAL RECORDS LOAD ERROR:", err);
      setError("Failed to load clinical records.");
    } finally {
      setLoading(false);
    }
  };

  // Visits that don't already have a clinical record, so the
  // dropdown never offers a choice the backend will reject. When
  // editing, keep the current record's own visit selectable too.
  const availableVisits = visits.filter((visit) => {
    const hasRecord = records.some(
      (record) => String(record.visit) === String(visit.id)
    );

    if (!hasRecord) return true;

    return editingId && String(formData.visit) === String(visit.id);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.visit) {
      setError("Please select a visit.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        visit: Number(formData.visit),
        allergies: formData.allergies,
        chronic_conditions: formData.chronic_conditions,
        current_medications: formData.current_medications,
        family_history: formData.family_history,
        medical_notes: formData.medical_notes,
      };

      if (editingId) {
        await updateClinicalRecord(editingId, payload);
        setSuccess("Clinical record updated successfully.");
      } else {
        await createClinicalRecord(payload);
        setSuccess("Clinical record created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("CLINICAL RECORD SAVE ERROR:", err);

      const backendMessage =
        err?.response?.data?.errors?.visit?.[0] ||
        err?.response?.data?.errors ||
        err?.response?.data?.message ||
        err?.response?.data?.detail;

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : editingId
            ? "Failed to update clinical record."
            : "Failed to create clinical record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    if (!canManage) return;

    setEditingId(record.id);
    setFormData({
      visit: record.visit || "",
      allergies: record.allergies || "",
      chronic_conditions: record.chronic_conditions || "",
      current_medications: record.current_medications || "",
      family_history: record.family_history || "",
      medical_notes: record.medical_notes || "",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    if (!window.confirm("Delete this clinical record?")) return;

    try {
      setError("");
      setSuccess("");

      await deleteClinicalRecord(id);
      setSuccess("Clinical record deleted successfully.");

      await loadData();
    } catch (err) {
      console.error("DELETE CLINICAL RECORD ERROR:", err);
      setError("Failed to delete clinical record.");
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FaFileMedical className="text-primary me-2" />
            Clinical Records
          </h2>
          <p className="text-muted mb-0">
            Create and manage patient clinical records.
          </p>
        </div>

        {canManage && (
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
            <FaPlus className="me-2" />
            {showForm ? "Close Form" : "New Clinical Record"}
          </button>
        )}
      </div>

      {error && <div className="alert alert-warning">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Form */}
      {showForm && canManage && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-4">
              {editingId ? "Edit Clinical Record" : "New Clinical Record"}
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Visit</label>

                  <select
                    className="form-select"
                    name="visit"
                    value={formData.visit}
                    onChange={handleChange}
                    required
                    disabled={Boolean(editingId)}
                  >
                    <option value="">Select a visit</option>

                    {availableVisits.map((visit) => (
                      <option key={visit.id} value={visit.id}>
                        {visit.patient_name || `Patient #${visit.patient}`}
                        {" — "}
                        {visit.reason || `Visit #${visit.id}`}
                      </option>
                    ))}
                  </select>

                  {editingId && (
                    <div className="form-text">
                      The visit for an existing record can't be changed.
                    </div>
                  )}

                  {!editingId && availableVisits.length === 0 && (
                    <div className="form-text text-warning">
                      No visits are available -- every visit already has
                      a clinical record, or no visits exist yet.
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Allergies</label>
                  <input
                    type="text"
                    className="form-control"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Penicillin, peanuts"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Chronic Conditions
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="chronic_conditions"
                    value={formData.chronic_conditions}
                    onChange={handleChange}
                    placeholder="e.g. Type 2 diabetes, hypertension"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Current Medications
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="current_medications"
                    value={formData.current_medications}
                    onChange={handleChange}
                    placeholder="e.g. Metformin 500mg twice daily"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Family History
                  </label>
                  <textarea
                    className="form-control"
                    name="family_history"
                    value={formData.family_history}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Relevant family medical history"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Medical Notes
                  </label>
                  <textarea
                    className="form-control"
                    name="medical_notes"
                    value={formData.medical_notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Additional clinical notes"
                  />
                </div>
              </div>

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
                      : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records list */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-muted py-3">Loading clinical records...</div>
          ) : records.length === 0 ? (
            <div className="text-muted py-3">
              No clinical records available yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Visit</th>
                    <th>Allergies</th>
                    <th>Chronic Conditions</th>
                    <th>Updated</th>
                    {canManage && <th className="text-end">Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="fw-semibold">
                        {record.patient_name || "—"}
                      </td>
                      <td>Visit #{record.visit}</td>
                      <td>{record.allergies || "None recorded"}</td>
                      <td>{record.chronic_conditions || "None recorded"}</td>
                      <td>
                        {record.updated_at
                          ? new Date(record.updated_at).toLocaleDateString()
                          : "—"}
                      </td>

                      {canManage && (
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(record)}
                          >
                            <FaEdit />
                          </button>

                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(record.id)}
                            >
                              <FaTrash />
                            </button>
                          )}
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

export default ClinicalRecords;