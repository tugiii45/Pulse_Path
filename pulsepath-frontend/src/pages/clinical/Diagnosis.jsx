import { useEffect, useState } from "react";
import { getDiagnoses, createDiagnosis } from "../../services/diagnosisService";
import { getVisits } from "../../services/visitService";

function Diagnosis() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [visits, setVisits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    visit: "",
    condition: "",
    icd10_code: "",
    severity: "MILD",
    status: "ACTIVE",
    notes: "",
  });

  useEffect(() => {
    loadDiagnoses();
  }, []);

  const loadDiagnoses = async () => {
    try {
      setLoading(true);

      const data = await getDiagnoses();

      console.log("DIAGNOSES API RESPONSE:", data);

      setDiagnoses(data.results || []);
    } catch (error) {
      console.error("Failed to load diagnoses:", error);
      setError("Failed to load diagnoses.");
    } finally {
      setLoading(false);
    }
  };

  const loadVisits = async () => {
    try {
      setLoadingVisits(true);

      const data = await getVisits();

      console.log("VISITS API RESPONSE:", data);

      setVisits(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error("Failed to load visits:", error);
      setError("Failed to load visits.");
    } finally {
      setLoadingVisits(false);
    }
  };

  const handleOpenForm = () => {
    setShowForm(true);
    setError("");
    setSuccess("");

    loadVisits();
  };

  const handleCloseForm = () => {
    setShowForm(false);

    setFormData({
      visit: "",
      condition: "",
      icd10_code: "",
      severity: "MILD",
      status: "ACTIVE",
      notes: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const diagnosisData = {
        ...formData,
        visit: Number(formData.visit),
      };

      console.log("CREATING DIAGNOSIS:", diagnosisData);

      await createDiagnosis(diagnosisData);

      setSuccess("Diagnosis added successfully!");

      handleCloseForm();

      await loadDiagnoses();
    } catch (error) {
      console.error("Failed to create diagnosis:", error);

      console.log("BACKEND ERROR:", error.response?.data);

      setError(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to add diagnosis."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Diagnoses</h2>
          <p className="text-muted mb-0">
            View and manage patient diagnoses.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenForm}
        >
          + Add Diagnosis
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Add Diagnosis Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Add Diagnosis</h5>

              <button
                type="button"
                className="btn-close"
                onClick={handleCloseForm}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="row">

                {/* Visit */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Visit
                  </label>

                  <select
                    className="form-select"
                    name="visit"
                    value={formData.visit}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      {loadingVisits
                        ? "Loading visits..."
                        : "Select a visit"}
                    </option>

                    {visits.map((visit) => (
                      <option key={visit.id} value={visit.id}>
                        Visit #{visit.id}{" "}
                        {visit.patient_name
                          ? `- ${visit.patient_name}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Condition
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    placeholder="e.g. Malaria"
                    required
                  />
                </div>

                {/* ICD-10 */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    ICD-10 Code
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="icd10_code"
                    value={formData.icd10_code}
                    onChange={handleChange}
                    placeholder="e.g. B54"
                  />
                </div>

                {/* Severity */}
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-semibold">
                    Severity
                  </label>

                  <select
                    className="form-select"
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                  >
                    <option value="MILD">Mild</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                  </select>
                </div>

                {/* Status */}
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CHRONIC">Chronic</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">
                    Notes
                  </label>

                  <textarea
                    className="form-control"
                    name="notes"
                    rows="4"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any relevant clinical notes..."
                  ></textarea>
                </div>

              </div>

              {/* Form Buttons */}
              <div className="d-flex justify-content-end gap-2">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCloseForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Save Diagnosis"
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Loading Diagnoses */}
      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-2 text-muted">
            Loading diagnoses...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && diagnoses.length === 0 && (
        <div className="alert alert-info">
          No diagnoses found.
        </div>
      )}

      {/* Diagnosis Table */}
      {!loading && !error && diagnoses.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Condition</th>
                    <th>ICD-10</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Diagnosed At</th>
                  </tr>
                </thead>

                <tbody>
                  {diagnoses.map((diagnosis) => (
                    <tr key={diagnosis.id}>

                      <td className="fw-semibold">
                        {diagnosis.patient_name}
                      </td>

                      <td>
                        {diagnosis.condition}
                      </td>

                      <td>
                        <span className="badge bg-light text-dark">
                          {diagnosis.icd10_code || "N/A"}
                        </span>
                      </td>

                      <td>
                        {diagnosis.severity}
                      </td>

                      <td>
                        {diagnosis.status}
                      </td>

                      <td>
                        {new Date(
                          diagnosis.diagnosed_at
                        ).toLocaleDateString()}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Diagnosis;

