import { useEffect, useState } from "react";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from "../../services/AppointmentService";
import { getPatients } from "../../services/PatientService";
import { getDoctors } from "../../services/DoctorService";

const initialFormState = {
  patient: "",
  doctor: "",
  appointment_date: "",
  status: "PENDING",
};

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [appointmentData, patientData, doctorData] = await Promise.all([
        getAppointments(),
        getPatients(),
        getDoctors(),
      ]);

      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
      setPatients(Array.isArray(patientData?.results) ? patientData.results : []);
      setDoctors(Array.isArray(doctorData?.results) ? doctorData.results : []);
    } catch (err) {
      console.error("APPOINTMENTS ERROR:", err);
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) return iso;

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-success";
      case "COMPLETED":
        return "bg-primary";
      case "CANCELLED":
        return "bg-danger";
      default:
        return "bg-warning text-dark";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient || !formData.doctor || !formData.appointment_date) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        patient: Number(formData.patient),
        doctor: Number(formData.doctor),
        appointment_date: new Date(formData.appointment_date).toISOString(),
        status: formData.status,
      };

      if (editingId) {
        await updateAppointment(editingId, payload);
        setSuccess("Appointment updated successfully.");
      } else {
        await createAppointment(payload);
        setSuccess("Appointment created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("APPOINTMENT SAVE ERROR:", err);
      const backendMessage = err?.response?.data?.errors || err?.response?.data?.message;
      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : editingId
            ? "Failed to update appointment."
            : "Failed to create appointment."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setFormData({
      patient: appointment.patient || "",
      doctor: appointment.doctor || "",
      appointment_date: appointment.appointment_date
        ? new Date(appointment.appointment_date).toISOString().slice(0, 16)
        : "",
      status: appointment.status || "PENDING",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;

    try {
      setError("");
      setSuccess("");
      await deleteAppointment(id);
      setSuccess("Appointment deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("DELETE APPOINTMENT ERROR:", err);
      setError("Failed to delete appointment.");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Appointments</h2>
          <p className="text-muted mb-0">
            Manage patient appointments and keep your schedule organized.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Close form" : "+ New Appointment"}
        </button>
      </div>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              {editingId ? "Edit Appointment" : "Create Appointment"}
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Patient</label>
                  <select
                    className="form-select"
                    name="patient"
                    value={formData.patient}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => {
                      const patientName =
                        patient.user?.full_name ||
                        patient.user?.first_name ||
                        patient.user?.email ||
                        patient.full_name ||
                        patient.name ||
                        `Patient ${patient.id}`;

                      return (
                        <option key={patient.id} value={patient.id}>
                          {patientName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Doctor</label>
                  <select
                    className="form-select"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => {
                      const doctorName =
                        doctor.user?.full_name ||
                        doctor.user?.first_name ||
                        doctor.user?.email ||
                        doctor.full_name ||
                        doctor.name ||
                        `Doctor ${doctor.id}`;

                      return (
                        <option key={doctor.id} value={doctor.id}>
                          {doctorName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Appointment Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
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
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (editingId ? "Saving..." : "Creating...") : editingId ? "Save Changes" : "Create Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-muted py-3">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-muted py-3">No appointments available yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="fw-semibold">{appointment.patient_name || "—"}</td>
                      <td>{appointment.doctor_name || "—"}</td>
                      <td>{formatDate(appointment.appointment_date)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                          {appointment.status || "PENDING"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(appointment)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          Delete
                        </button>
                      </td>
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

export default Appointments;
