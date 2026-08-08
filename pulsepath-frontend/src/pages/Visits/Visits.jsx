import { useEffect, useState } from "react";
import {
    FaNotesMedical,
    FaEye,
    FaSyncAlt,
    FaPlus,
    FaTimes,
} from "react-icons/fa";
import { getVisits, createVisit } from "../../services/visitService";
import { getAppointments } from "../../services/appointmentService";

function Visit() {
    const [visits, setVisits] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        appointment: "",
        patient: "",
        patientName: "",
        reason: "",
        symptoms: "",
        diagnosis: "",
        notes: "",
    });

    const loadVisits = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getVisits();

            setVisits(response.data?.results || []);
        } catch (err) {
            console.error("VISITS ERROR:", err);
            setError("Failed to load visits.");
        } finally {
            setLoading(false);
        }
    };

    const loadAppointments = async () => {
        try {
            setLoadingAppointments(true);

            const response = await getAppointments();

            setAppointments(response.results || []);
        } catch (err) {
            console.error("APPOINTMENTS ERROR:", err);
            setFormError("Failed to load appointments.");
        } finally {
            setLoadingAppointments(false);
        }
    };

    useEffect(() => {
        loadVisits();
    }, []);

    const handleAppointmentChange = (e) => {
        const appointmentId = e.target.value;

        const selectedAppointment = appointments.find(
            (appointment) => String(appointment.id) === appointmentId,
        );

        setFormData({
            ...formData,
            appointment: appointmentId,
            patient: selectedAppointment?.patient || "",
            patientName: selectedAppointment?.patient_name || "",
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleShowForm = async () => {
        setShowForm(true);
        setFormError("");

        if (appointments.length === 0) {
            await loadAppointments();
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setFormError("");

        setFormData({
            appointment: "",
            patient: "",
            patientName: "",
            reason: "",
            symptoms: "",
            diagnosis: "",
            notes: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setFormError("");

                await createVisit({
                    appointment: Number(formData.appointment),
                    patient: Number(formData.patient),
                    reason: formData.reason,
                    symptoms: formData.symptoms,
                    diagnosis: formData.diagnosis,
                    notes: formData.notes,
                });

                handleCloseForm();
                await loadVisits();
            } catch (err) {
                console.error("CREATE VISIT ERROR:", err);

                setFormError(err.response?.data?.message || "Failed to create visit.");
            } finally {
                setSaving(false);
            }
        };

        return (
            <div className="container-fluid py-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            <FaNotesMedical className="text-primary me-2" />
                            Visits
                        </h2>

                        <p className="text-muted mb-0">Patient visits and consultations</p>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-primary"
                            onClick={loadVisits}
                            disabled={loading}
                        >
                            <FaSyncAlt className="me-2" />
                            Refresh
                        </button>

                        <button className="btn btn-primary" onClick={handleShowForm}>
                            <FaPlus className="me-2" />
                            New Visit
                        </button>
                    </div>
                </div>

                {/* Create Visit Form */}
                {showForm && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1">Create Visit</h4>

                                    <p className="text-muted mb-0">
                                        Record a patient consultation.
                                    </p>
                                </div>

                                <button className="btn btn-light" onClick={handleCloseForm}>
                                    <FaTimes />
                                </button>
                            </div>

                            {formError && <div className="alert alert-danger">{formError}</div>}

                            <form onSubmit={handleSubmit}>
                                {/* Appointment */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Appointment</label>

                                    <select
                                        className="form-select"
                                        value={formData.appointment}
                                        onChange={handleAppointmentChange}
                                        required
                                        disabled={loadingAppointments}
                                    >
                                        <option value="">
                                            {loadingAppointments
                                                ? "Loading appointments..."
                                                : "Select an appointment"}
                                        </option>

                                        {appointments.map((appointment) => (
                                            <option key={appointment.id} value={appointment.id}>
                                                {appointment.patient_name} — {appointment.doctor_name} —{" "}
                                                {new Date(appointment.appointment_date).toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Patient */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Patient</label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.patientName || "Select an appointment first"}
                                        disabled
                                    />
                                </div>

                                {/* Reason */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Reason for Visit
                                    </label>

                                    <input
                                        type="text"
                                        name="reason"
                                        className="form-control"
                                        placeholder="e.g. Follow-up consultation"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Symptoms */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Symptoms</label>

                                    <textarea
                                        name="symptoms"
                                        className="form-control"
                                        rows="3"
                                        placeholder="Describe the patient's symptoms"
                                        value={formData.symptoms}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Diagnosis */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Diagnosis</label>

                                    <textarea
                                        name="diagnosis"
                                        className="form-control"
                                        rows="3"
                                        placeholder="Enter the consultation diagnosis"
                                        value={formData.diagnosis}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Notes */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Notes</label>

                                    <textarea
                                        name="notes"
                                        className="form-control"
                                        rows="4"
                                        placeholder="Additional consultation notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleCloseForm}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? "Creating..." : "Create Visit"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Visits */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>

                        <p className="text-muted mt-3">Loading visits...</p>
                    </div>
                ) : visits.length === 0 ? (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <FaNotesMedical size={45} className="text-muted mb-3" />

                            <h5 className="fw-bold">No visits found</h5>

                            <p className="text-muted mb-0">Patient visits will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {visits.map((visit) => (
                            <div className="col-md-6 col-xl-4" key={visit.id}>
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h5 className="fw-bold mb-1">{visit.patient_name}</h5>

                                                <small className="text-muted">Visit #{visit.id}</small>
                                            </div>

                                            <FaNotesMedical className="text-primary" size={24} />
                                        </div>

                                        <hr />

                                        <p className="mb-2">
                                            <strong>Reason:</strong> {visit.reason || "Not provided"}
                                        </p>

                                        <p className="mb-2">
                                            <strong>Symptoms:</strong>{" "}
                                            {visit.symptoms || "None recorded"}
                                        </p>

                                        <p className="mb-2">
                                            <strong>Diagnosis:</strong>{" "}
                                            {visit.diagnosis || "Not recorded"}
                                        </p>

                                        <p className="mb-2">
                                            <strong>Notes:</strong> {visit.notes || "No notes"}
                                        </p>

                                        <p className="text-muted small mt-3">
                                            Visit date:{" "}
                                            {new Date(visit.visit_date).toLocaleDateString()}
                                        </p>

                                        <button className="btn btn-outline-primary btn-sm">
                                            <FaEye className="me-2" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    export default Visit;
