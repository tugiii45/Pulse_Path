import { useEffect, useState } from "react";
import {
  getMedicationLogs,
  createMedicationLog,
  updateMedicationLog,
  deleteMedicationLog,
} from "../../services/medicationLogService";
import { getMedicationSchedules } from "../../services/medicationScheduleService";
import { useAuth } from "../../contexts/AuthContext";

function MedicationLog() {
  const { profile } = useAuth();

  // Store medication logs returned by the API.
  const [logs, setLogs] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Store form data when creating or editing a log.
  const [formData, setFormData] = useState({
    medication_schedule: "",
    status: "TAKEN",
    notes: "",
  });

  // Keep track of whether we are editing an existing log.
  // Only ever set via handleEdit, which is only reachable by
  // canManage roles (doctor/admin) — see the Actions column below.
  // A patient recording their own intake always creates a new log,
  // never edits one.
  const [editingId, setEditingId] = useState(null);

  // Loading and error states.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Control form visibility.
  const [showForm, setShowForm] = useState(false);

  // Load medication logs when the page opens.
  useEffect(() => {
    // Both fire immediately and independently — schedules doesn't
    // block/depend on logs or vice versa, and neither waits on
    // `profile` to resolve first (schedules are needed to populate
    // the form's medication dropdown for anyone who can open it).
    loadLogs();
    loadSchedules();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMedicationLogs();

      console.log("MEDICATION LOGS API RESPONSE:", data);

      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load medication logs:", error);
      setError("Unable to load medication logs.");
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    // Note: unlike loadLogs, this doesn't set `loading` or surface a
    // user-facing `error` on failure — a schedules-fetch failure only
    // logs to the console and silently leaves the dropdown empty,
    // rather than blocking the page or showing an alert.
    try {
      const data = await getMedicationSchedules();

      console.log("MEDICATION SCHEDULES API RESPONSE:", data);

      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load medication schedules:", error);
    }
  };

  // Update form fields as the user types.
  const handleChange = (e) => {
    const { name, value } = e.target;

    // No checkbox handling needed here (unlike
    // MedicationSchedule.jsx's handleChange) since this form has no
    // boolean fields — status/medication_schedule are <select>s and
    // notes is a <textarea>, all plain string values.
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Clear the form.
  const resetForm = () => {
    setFormData({
      medication_schedule: "",
      status: "TAKEN",
      notes: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Create or update a medication log.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // medication_schedule comes from a <select>, so its value is a
      // string in form state — cast to Number for the numeric FK the
      // backend expects.
      const payload = {
        medication_schedule: Number(formData.medication_schedule),
        status: formData.status,
        notes: formData.notes,
      };

      if (editingId) {
        // Update an existing medication log.
        // In practice, only reachable by canManage roles, since
        // editingId can only be set via handleEdit, whose button is
        // gated by canManage below.
        await updateMedicationLog(editingId, payload);
      } else {
        // Create a new medication log.
        // This is the path a patient takes when recording their own
        // medication intake.
        await createMedicationLog(payload);
      }

      // Reload the list after saving.
      await loadLogs();

      // Reset the form.
      resetForm();
    } catch (error) {
      console.error("Unable to save medication log:", error);
      setError("Unable to save medication log.");
    }
  };

  // Prepare a medication log for editing.
  const handleEdit = (log) => {
    // No explicit canManage guard here — relies entirely on the Edit
    // button only being rendered for canManage roles (see the
    // Actions column further down), unlike Visits.jsx/Treatment.jsx
    // which double-check role inside the handler itself.
    setEditingId(log.id);

    setFormData({
      medication_schedule: log.medication_schedule || "",
      status: log.status || "TAKEN",
      notes: log.notes || "",
    });

    setShowForm(true);
  };

  // Delete a medication log.
  const handleDelete = async (id) => {
    // Same as handleEdit above: no inline role guard, relies on the
    // Delete button only rendering for canManage.
    const confirmed = window.confirm(
      "Are you sure you want to delete this medication log?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteMedicationLog(id);

      // Reload the list after deletion.
      await loadLogs();
    } catch (error) {
      console.error("Unable to delete medication log:", error);
      setError("Unable to delete medication log.");
    }
  };

  // Determine the user's role.
  const role = profile?.role?.toUpperCase();

  // Patients should only view medication logs.
  // (Comment as originally written — note this actually governs the
  // Actions/Edit/Delete column below, not general viewing. See
  // canRecordMedication just below for who can create/view the form.)
  const canManage = role === "ADMIN" || role === "DOCTOR";

  // Unlike every other "canManage"-style flag in this app's other
  // pages, patients ARE included here — this page's central purpose
  // is letting patients log their own medication intake, while
  // doctors/admins can additionally correct/manage any log via Edit
  // and Delete (gated separately by canManage above).
  const canRecordMedication =
    role === "PATIENT" || role === "ADMIN" || role === "DOCTOR";

  // Display a Bootstrap badge based on the medication status.
  const getStatusBadge = (status) => {
    switch (status) {
      case "TAKEN":
        return <span className="badge bg-success">Taken</span>;

      case "MISSED":
        return <span className="badge bg-danger">Missed</span>;

      case "SKIPPED":
        return <span className="badge bg-warning text-dark">Skipped</span>;

      default:
        // Covers null/undefined/unexpected status values.
        return (
          <span className="badge bg-secondary">{status || "Unknown"}</span>
        );
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Page heading */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Medication Log</h2>

          <p className="text-muted mb-0">
            View and manage medication intake records.
          </p>
        </div>

        {/* Only doctors/admins should see the Add button. */}
        {/* (Comment as originally written — note the condition below
            is actually canRecordMedication, which includes PATIENT
            too; this button is really "Record Medication" for anyone
            who can log an intake, not admin/doctor-only.) */}
        {canRecordMedication && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Record Medication
          </button>
        )}
      </div>

      {/* Display API errors */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Medication log form */}
      {showForm && canRecordMedication && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-4">
              {editingId ? "Edit Medication Log" : "Record Medication"}
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Medication Schedule */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Medication</label>

                  {/* Dropdown built from `schedules` (loaded via
                      getMedicationSchedules) rather than a free-typed
                      ID like MedicationSchedule.jsx's own form uses
                      for its Prescription field — this ensures only
                      a real, existing schedule can be selected. */}
                  <select
                    name="medication_schedule"
                    className="form-select"
                    value={formData.medication_schedule}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select medication</option>

                    {schedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.prescription_details} —{" "}
                        {new Date(schedule.scheduled_time).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Status</label>

                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="TAKEN">Taken</option>

                    <option value="MISSED">Missed</option>

                    <option value="SKIPPED">Skipped</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="col-12 mb-3">
                  <label className="form-label">Notes</label>

                  <textarea
                    name="notes"
                    className="form-control"
                    rows="3"
                    placeholder="Add any notes about the medication..."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Log" : "Save Log"}
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

      {/* Medication log table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Medication Log List</h5>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-muted py-4">
              No medication logs found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Schedule</th>
                    <th>Taken At</th>
                    <th>Status</th>
                    <th>Notes</th>

                    {/* Actions column (Edit/Delete) is admin/doctor
                        only — a patient who created a log cannot
                        edit or delete it afterward from this page. */}
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        {/* Shows only the raw schedule id — unlike
                            MedicationSchedule.jsx's table, there's no
                            resolved prescription_details shown here
                            underneath it. */}
                        <span className="fw-semibold">
                          Schedule #{log.medication_schedule}
                        </span>
                      </td>

                      <td>
                        {log.taken_at
                          ? new Date(log.taken_at).toLocaleString()
                          : "-"}
                      </td>

                      <td>{getStatusBadge(log.status)}</td>

                      <td>{log.notes || "-"}</td>

                      {canManage && (
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(log)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(log.id)}
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

export default MedicationLog;