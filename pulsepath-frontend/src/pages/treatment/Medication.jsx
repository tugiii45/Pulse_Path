import { useEffect, useState } from "react";
import {
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
} from "../../services/medicationService";
import { useAuth } from "../../contexts/AuthContext";

function Medication() {
  const { profile } = useAuth();

  // Store the medications returned by the API.
  const [medications, setMedications] = useState([]);

  // Store form data when creating or editing a medication.
  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    manufacturer: "",
    strength: "",
    dosage_form: "",
    description: "",
  });

  // Keep track of whether we are editing an existing medication.
  const [editingId, setEditingId] = useState(null);

  // Loading and error states.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Control the form visibility.
  const [showForm, setShowForm] = useState(false);

  // Load medications when the page opens.
  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMedications();

      console.log("MEDICATIONS API RESPONSE:", data);

      setMedications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load medications:", error);
      setError("Unable to load medications.");
    } finally {
      setLoading(false);
    }
  };

  // Update form fields as the user types.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Clear the form.
  const resetForm = () => {
    setFormData({
      name: "",
      generic_name: "",
      manufacturer: "",
      strength: "",
      dosage_form: "",
      description: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Create or update a medication.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (editingId) {
        // Update an existing medication.
        await updateMedication(editingId, formData);
      } else {
        // Create a new medication.
        await createMedication(formData);
      }

      // Reload the list after saving.
      await loadMedications();

      // Reset the form.
      resetForm();
    } catch (error) {
      console.error("Unable to save medication:", error);
      setError("Unable to save medication.");
    }
  };

  // Prepare a medication for editing.
  const handleEdit = (medication) => {
    setEditingId(medication.id);

    setFormData({
      name: medication.name || "",
      generic_name: medication.generic_name || "",
      manufacturer: medication.manufacturer || "",
      strength: medication.strength || "",
      dosage_form: medication.dosage_form || "",
      description: medication.description || "",
    });

    setShowForm(true);
  };

  // Delete a medication.
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medication?"
    );

    if (!confirmed) return;

    try {
      await deleteMedication(id);

      // Reload the list after deletion.
      await loadMedications();
    } catch (error) {
      console.error("Unable to delete medication:", error);
      setError("Unable to delete medication.");
    }
  };

  // Determine the user's role.
  const role = profile?.role?.toUpperCase();

  // Patients should only view medications.
  const canManage = role === "ADMIN" || role === "DOCTOR";

  return (
    <div className="container-fluid py-4">

      {/* Page heading */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Medications</h2>
          <p className="text-muted mb-0">
            View and manage medications.
          </p>
        </div>

        {/* Only doctors/admins should see the Add button. */}
        {canManage && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Medication
          </button>
        )}
      </div>

      {/* Display API errors. */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Medication form */}
      {showForm && canManage && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">

            <h5 className="card-title mb-4">
              {editingId ? "Edit Medication" : "Add Medication"}
            </h5>

            <form onSubmit={handleSubmit}>

              <div className="row">

                {/* Medication name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Generic name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Generic Name
                  </label>

                  <input
                    type="text"
                    name="generic_name"
                    className="form-control"
                    value={formData.generic_name}
                    onChange={handleChange}
                  />
                </div>

                {/* Manufacturer */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Manufacturer
                  </label>

                  <input
                    type="text"
                    name="manufacturer"
                    className="form-control"
                    value={formData.manufacturer}
                    onChange={handleChange}
                  />
                </div>

                {/* Strength */}
                <div className="col-md-3 mb-3">
                  <label className="form-label">
                    Strength
                  </label>

                  <input
                    type="text"
                    name="strength"
                    className="form-control"
                    placeholder="e.g. 500mg"
                    value={formData.strength}
                    onChange={handleChange}
                  />
                </div>

                {/* Dosage form */}
                <div className="col-md-3 mb-3">
                  <label className="form-label">
                    Dosage Form
                  </label>

                  <input
                    type="text"
                    name="dosage_form"
                    className="form-control"
                    placeholder="e.g. Tablet"
                    value={formData.dosage_form}
                    onChange={handleChange}
                  />
                </div>

                {/* Description */}
                <div className="col-12 mb-3">
                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

              </div>

              {/* Form buttons */}
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingId ? "Update Medication" : "Save Medication"}
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

      {/* Medication table */}
      <div className="card shadow-sm">
        <div className="card-body">

          <h5 className="card-title mb-3">
            Medication List
          </h5>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border"></div>
            </div>
          ) : medications.length === 0 ? (
            <div className="text-center text-muted py-4">
              No medications found.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Generic Name</th>
                    <th>Manufacturer</th>
                    <th>Strength</th>
                    <th>Dosage Form</th>

                    {/* Actions are only available to staff. */}
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {medications.map((medication) => (
                    <tr key={medication.id}>

                      <td className="fw-semibold">
                        {medication.name}
                      </td>

                      <td>
                        {medication.generic_name || "-"}
                      </td>

                      <td>
                        {medication.manufacturer || "-"}
                      </td>

                      <td>
                        {medication.strength || "-"}
                      </td>

                      <td>
                        {medication.dosage_form || "-"}
                      </td>

                      {canManage && (
                        <td>
                          <div className="d-flex gap-2">

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(medication)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(medication.id)
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

export default Medication;