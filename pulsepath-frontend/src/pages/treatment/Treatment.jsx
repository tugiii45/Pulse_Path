import { useEffect, useState } from "react";
import {
  createTreatment,
  deleteTreatment,
  getPrescriptions,
  getTreatments,
  updateTreatment,
} from "../../services/treatmentService";
import { useAuth } from "../../contexts/AuthContext";

const initialFormState = {
  prescription: "",
  follow_up_date: "",
  status: "ACTIVE",
};

function Treatment() {
  // =========================================================
  // AUTHENTICATION / ROLE
  // =========================================================

  const { profile } = useAuth();

  const role = profile?.role;

  const isPatient = role === "PATIENT";
  const isDoctor = role === "DOCTOR";
  const isAdmin = role === "ADMIN";

  // =========================================================
  // STATE
  // =========================================================

  const [treatments, setTreatments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  // Stores the treatment ID when editing.
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(initialFormState);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    if (!profile) return;

    loadData();
  }, [profile]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load treatments.
      // The backend handles hospital/role-based filtering.
      const treatmentData = await getTreatments();

      setTreatments(
        Array.isArray(treatmentData)
          ? treatmentData
          : []
      );

      // Only Doctor and Admin need prescriptions
      // because they can create/edit treatments.
      if (isDoctor || isAdmin) {
        const prescriptionData = await getPrescriptions();

        setPrescriptions(
          Array.isArray(prescriptionData)
            ? prescriptionData
            : []
        );
      }
    } catch (err) {
      console.error("TREATMENT LOAD ERROR:", err);

      setError("Failed to load treatment information.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORM HANDLER
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
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
  // CREATE / UPDATE TREATMENT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Make sure a prescription has been selected.
    if (!formData.prescription) {
      setError("Please select a prescription.");
      return;
    }

    // Make sure a follow-up date exists.
    if (!formData.follow_up_date) {
      setError("Please select a follow-up date.");
      return;
    }

    try {
      setSaving(true);

      // Payload matches the backend Treatment schema:
      //
      // {
      //   prescription: 0,
      //   follow_up_date: "2026-08-15",
      //   status: "ACTIVE"
      // }

      const payload = {
        prescription: Number(formData.prescription),
        follow_up_date: formData.follow_up_date,
        status: formData.status,
      };

      // -------------------------------------------------------
      // UPDATE
      // -------------------------------------------------------

      if (editingId) {
        await updateTreatment(editingId, payload);

        setSuccess("Treatment updated successfully.");

        resetForm();

        await loadData();

        return;
      }

      // -------------------------------------------------------
      // CREATE
      // -------------------------------------------------------

      await createTreatment(payload);

      setSuccess("Treatment created successfully.");

      resetForm();

      await loadData();
    } catch (err) {
      console.error("TREATMENT SAVE ERROR:", err);

      const backendMessage =
        err?.response?.data?.errors ||
        err?.response?.data?.message ||
        err?.response?.data?.detail;

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : editingId
          ? "Failed to update treatment."
          : "Failed to create treatment."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT TREATMENT
  // =========================================================

  const handleEdit = (treatment) => {
    // Patients should not be able to edit treatments.
    if (!isDoctor && !isAdmin) return;

    setEditingId(treatment.id);

    setFormData({
      prescription: treatment.prescription || "",
      follow_up_date: treatment.follow_up_date || "",
      status: treatment.status || "ACTIVE",
    });

    setShowForm(true);

    setError("");
    setSuccess("");
  };

  // =========================================================
  // DELETE TREATMENT
  // =========================================================
  //
  // We expose Delete only to Admin.
  // The backend still remains the final authority.
  // =========================================================

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this treatment?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteTreatment(id);

      setSuccess("Treatment deleted successfully.");

      await loadData();
    } catch (err) {
      console.error("DELETE TREATMENT ERROR:", err);

      setError("Failed to delete treatment.");
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // =========================================================
  // GET PRESCRIPTION DISPLAY NAME
  // =========================================================

  const getPrescriptionLabel = (prescription) => {
    const medicationName =
      prescription.medication_name || "Medication";

    const dosage = prescription.dosage
      ? ` — ${prescription.dosage}`
      : "";

    const frequency = prescription.frequency
      ? ` — ${prescription.frequency}`
      : "";

    return `Prescription #${prescription.id} — ${medicationName}${dosage}${frequency}`;
  };

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
            Treatment
          </h2>

          <p className="text-muted mb-0">
            {isPatient
              ? "View your treatment information and follow-up dates."
              : "View and manage patient treatments."}
          </p>
        </div>

        {/* ---------------------------------------------------
            ONLY DOCTOR AND ADMIN CAN CREATE TREATMENTS
        --------------------------------------------------- */}

        {(isDoctor || isAdmin) && (
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
              ? "Close Form"
              : editingId
              ? "Edit Treatment"
              : "+ New Treatment"}
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
                ? "Edit Treatment"
                : "Create Treatment"}
            </h5>

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                {/* =================================================
                    PRESCRIPTION
                ================================================== */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Prescription
                  </label>

                  <select
                    className="form-select"
                    name="prescription"
                    value={formData.prescription}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select a prescription
                    </option>

                    {prescriptions.map((prescription) => (
                      <option
                        key={prescription.id}
                        value={prescription.id}
                      >
                        {getPrescriptionLabel(
                          prescription
                        )}
                      </option>
                    ))}
                  </select>

                </div>

                {/* =================================================
                    FOLLOW-UP DATE
                ================================================== */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Follow-up Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    name="follow_up_date"
                    value={formData.follow_up_date}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* =================================================
                    STATUS
                ================================================== */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>

                    <option value="CANCELLED">
                      Cancelled
                    </option>
                  </select>

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
                    : "Create Treatment"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          TREATMENTS TABLE
      ====================================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          {loading ? (

            <div className="text-muted py-3">
              Loading treatments...
            </div>

          ) : treatments.length === 0 ? (

            <div className="text-muted py-3">
              No treatments available.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table align-middle mb-0">

                <thead>
                  <tr>
                    <th>Prescription</th>
                    <th>Follow-up Date</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {treatments.map((treatment) => {

                    // Find the prescription associated with
                    // this treatment so we can display the
                    // medication name.
                    const prescription =
                      prescriptions.find(
                        (item) =>
                          String(item.id) ===
                          String(treatment.prescription)
                      );

                    return (
                      <tr key={treatment.id}>

                        {/* Prescription / medication */}

                        <td className="fw-semibold">
                          {prescription?.medication_name ||
                            `Prescription #${treatment.prescription}`}
                        </td>

                        {/* Follow-up date */}

                        <td>
                          {formatDate(
                            treatment.follow_up_date
                          )}
                        </td>

                        {/* Status */}

                        <td>
                          <span
                            className={`badge ${
                              treatment.status ===
                              "ACTIVE"
                                ? "text-bg-success"
                                : treatment.status ===
                                  "COMPLETED"
                                ? "text-bg-primary"
                                : "text-bg-secondary"
                            }`}
                          >
                            {treatment.status}
                          </span>
                        </td>

                        {/* Created date */}

                        <td>
                          {formatDate(
                            treatment.created_at
                          )}
                        </td>

                        {/* Actions */}

                        <td>

                          {/* Doctor and Admin can edit */}

                          {(isDoctor || isAdmin) && (
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() =>
                                handleEdit(treatment)
                              }
                            >
                              Edit
                            </button>
                          )}

                          {/* Admin can delete */}

                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(
                                  treatment.id
                                )
                              }
                            >
                              Delete
                            </button>
                          )}

                          {/* Patient has read-only access */}

                          {isPatient && (
                            <span className="text-muted">
                              View only
                            </span>
                          )}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default Treatment;