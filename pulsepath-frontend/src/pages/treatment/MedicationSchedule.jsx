import { useEffect, useState } from "react";
import {
  getMedicationSchedules,
  createMedicationSchedule,
  updateMedicationSchedule,
  deleteMedicationSchedule,
} from "../../services/medicationScheduleService";
import { useAuth } from "../../contexts/AuthContext";

function MedicationSchedule() {
  const { profile } = useAuth();

  // Store medication schedules returned by the API.
  const [schedules, setSchedules] = useState([]);

  // Store form data when creating or editing a schedule.
  const [formData, setFormData] = useState({
    prescription: "",
    scheduled_time: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  // Keep track of whether we are editing an existing schedule.
  const [editingId, setEditingId] = useState(null);

  // Loading and error states.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Control the form visibility.
  const [showForm, setShowForm] = useState(false);

  // Load medication schedules when the page opens.
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMedicationSchedules();

      console.log("MEDICATION SCHEDULES API RESPONSE:", data);

      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load medication schedules:", error);
      setError("Unable to load medication schedules.");
    } finally {
      setLoading(false);
    }
  };

  // Update form fields as the user types.
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
      prescription: "",
      scheduled_time: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Create or update a medication schedule.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        prescription: Number(formData.prescription),
        scheduled_time: formData.scheduled_time,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
      };

      if (editingId) {
        // Update an existing medication schedule.
        await updateMedicationSchedule(editingId, payload);
      } else {
        // Create a new medication schedule.
        await createMedicationSchedule(payload);
      }

      // Reload the list after saving.
      await loadSchedules();

      // Reset the form.
      resetForm();
    } catch (error) {
      console.error("Unable to save medication schedule:", error);
      setError("Unable to save medication schedule.");
    }
  };

  // Prepare a schedule for editing.
  const handleEdit = (schedule) => {
    setEditingId(schedule.id);

    setFormData({
      prescription: schedule.prescription || "",
      scheduled_time: schedule.scheduled_time
        ? schedule.scheduled_time.slice(0, 16)
        : "",
      start_date: schedule.start_date || "",
      end_date: schedule.end_date || "",
      is_active: schedule.is_active ?? true,
    });

    setShowForm(true);
  };

  // Delete a medication schedule.
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medication schedule?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteMedicationSchedule(id);

      // Reload the list after deletion.
      await loadSchedules();
    } catch (error) {
      console.error("Unable to delete medication schedule:", error);
      setError("Unable to delete medication schedule.");
    }
  };

  // Determine the user's role.
  const role = profile?.role?.toUpperCase();

  // Patients should only view medication schedules.
  const canManage = role === "ADMIN" || role === "DOCTOR";

  return (
    <div className="container-fluid py-4">

      {/* Page heading */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Medication Schedule</h2>

          <p className="text-muted mb-0">
            View and manage medication schedules.
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
            Add Schedule
          </button>
        )}
      </div>

      {/* Display API errors */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Medication schedule form */}
      {showForm && canManage && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">

            <h5 className="card-title mb-4">
              {editingId
                ? "Edit Medication Schedule"
                : "Add Medication Schedule"}
            </h5>

            <form onSubmit={handleSubmit}>

              <div className="row">

                {/* Prescription */}
                <div className="col-md-6 mb-3">
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

                  <small className="text-muted">
                    Enter the ID of the prescription this schedule belongs to.
                  </small>
                </div>

                {/* Scheduled time */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Scheduled Time
                  </label>

                  <input
                    type="datetime-local"
                    name="scheduled_time"
                    className="form-control"
                    value={formData.scheduled_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Start date */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="start_date"
                    className="form-control"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* End date */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="end_date"
                    className="form-control"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Active status */}
                <div className="col-12 mb-3">
                  <div className="form-check">

                    <input
                      type="checkbox"
                      name="is_active"
                      className="form-check-input"
                      id="isActive"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />

                    <label
                      className="form-check-label"
                      htmlFor="isActive"
                    >
                      Active Schedule
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
                    ? "Update Schedule"
                    : "Save Schedule"}
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

      {/* Medication schedule table */}
      <div className="card shadow-sm">
        <div className="card-body">

          <h5 className="card-title mb-3">
            Medication Schedule List
          </h5>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border"></div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center text-muted py-4">
              No medication schedules found.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Prescription</th>
                    <th>Scheduled Time</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>

                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id}>

                      <td>
                        <div className="fw-semibold">
                          Prescription #{schedule.prescription}
                        </div>

                        <small className="text-muted">
                          {schedule.prescription_details || "-"}
                        </small>
                      </td>

                      <td>
                        {schedule.scheduled_time
                          ? new Date(
                              schedule.scheduled_time
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        {schedule.start_date || "-"}
                      </td>

                      <td>
                        {schedule.end_date || "-"}
                      </td>

                      <td>
                        {schedule.is_active ? (
                          <span className="badge bg-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            Inactive
                          </span>
                        )}
                      </td>

                      {canManage && (
                        <td>
                          <div className="d-flex gap-2">

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleEdit(schedule)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(schedule.id)
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

export default MedicationSchedule;