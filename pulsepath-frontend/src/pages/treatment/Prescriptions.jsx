import { useEffect, useState } from "react";
import {
  getPrescriptions,
  createPrescription,
} from "../../services/prescriptionService";

import { getMedications } from "../../services/medicationService";
import { getDiagnoses } from "../../services/diagnosisService";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

// Note: unlike Visits, Treatment, SideEffect, and RecoveryProgress,
// this component has no useAuth()/role checks at all — the create
// form and table always render for whoever loads this page. Access
// control here is presumably enforced entirely on the backend
// (e.g. the prescription create/list endpoints likely reject or
// filter for non-doctor/admin users), rather than being hidden in
// the UI like the other pages. Worth confirming that's intentional,
// since a patient hitting this page would currently see a full
// "Add Prescription" form even if their submission would ultimately
// be rejected server-side.
function Prescription() {
  // Stores all prescription records.
  const [prescriptions, setPrescriptions] = useState([]);

  // Stores diagnoses for the diagnosis dropdown.
  const [diagnoses, setDiagnoses] = useState([]);

  // Stores medications for the medication dropdown.
  const [medications, setMedications] = useState([]);

  // Form state.
  const [formData, setFormData] = useState({
    diagnosis: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  // Loading and error states.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load prescriptions, diagnoses and medications.
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // All three requests fire in parallel via Promise.all rather
      // than sequentially, since they're independent of each other
      // and this cuts total load time roughly to that of the
      // slowest single request instead of the sum of all three.
      const [prescriptionData, diagnosisData, medicationData] =
        await Promise.all([
          getPrescriptions(),
          getDiagnoses(),
          getMedications(),
        ]);

      // Unlike other pages in this app, there's no
      // Array.isArray(...) ? ... : [] guard here — if any of these
      // three calls returns something other than an array (e.g. an
      // unexpected response shape), setPrescriptions/etc. would
      // store that non-array value directly, which could break the
      // .map() calls further down.
      setPrescriptions(prescriptionData);
      setDiagnoses(diagnosisData);
      setMedications(medicationData);
    } catch (err) {
      console.error("Unable to load prescription data:", err);
      setError(getFriendlyErrorMessage(err, "Unable to load prescriptions. Please check your connection and try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update form fields when the user types/selects something.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit a new prescription.
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      // Convert IDs and duration to numbers before sending them.
      // diagnosis/medication are <select> values (always strings in
      // the DOM) that map to numeric FK ids on the backend; duration
      // similarly comes from a number input but is still a string
      // until explicitly converted.
      const payload = {
        diagnosis: Number(formData.diagnosis),
        medication: Number(formData.medication),
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: Number(formData.duration),
        instructions: formData.instructions,
      };

      await createPrescription(payload);

      // Clear the form after successful creation.
      setFormData({
        diagnosis: "",
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });

      // Refresh the prescription records.
      // Re-fetches everything (prescriptions + diagnoses +
      // medications) rather than just the prescriptions list, even
      // though diagnoses/medications didn't change — simplest way to
      // stay consistent with how the other pages in this app always
      // reload full state after a mutation, at the cost of two
      // unnecessary requests.
      await loadData();
    } catch (err) {
      console.error("Unable to create prescription:", err);
      setError(getFriendlyErrorMessage(err, "Unable to create prescription. Please check the diagnosis, medication, dosage, and duration."));
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* Page heading */}
      <div className="mb-4">
        <h2>Prescriptions</h2>
        <p className="text-muted">
          Create and manage patient prescriptions.
        </p>
      </div>

      {/* Display API errors */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Add Prescription */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <h5 className="card-title mb-4">
            Add Prescription
          </h5>

          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* Diagnosis */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Diagnosis
                </label>

                <select
                  className="form-select"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select diagnosis
                  </option>

                  {diagnoses.map((diagnosis) => (
                    <option
                      key={diagnosis.id}
                      value={diagnosis.id}
                    >
                      {diagnosis.condition} —{" "}
                      {diagnosis.patient_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medication */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Medication
                </label>

                <select
                  className="form-select"
                  name="medication"
                  value={formData.medication}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select medication
                  </option>

                  {medications.map((medication) => (
                    <option
                      key={medication.id}
                      value={medication.id}
                    >
                      {medication.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dosage */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Dosage
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="e.g. 500mg"
                  required
                />
              </div>

              {/* Frequency */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Frequency
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  placeholder="e.g. Twice daily"
                  required
                />
              </div>

              {/* Duration */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Duration (days)
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              {/* Instructions */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Instructions
                </label>

                <textarea
                  className="form-control"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Enter medication instructions"
                  rows="2"
                  required
                />
              </div>

            </div>

            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Prescription
            </button>

          </form>
        </div>
      </div>

      {/* Prescription Records */}
      <div className="card shadow-sm">
        <div className="card-body">

          <h5 className="card-title mb-4">
            Prescription Records
          </h5>

          {loading ? (
            <p>Loading prescriptions...</p>
          ) : prescriptions.length === 0 ? (
            <p className="text-muted">
              No prescriptions found.
            </p>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Diagnosis</th>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>

                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>{prescription.id}</td>

                      {/* Note: this renders prescription.diagnosis
                          directly, which is presumably the raw
                          diagnosis id/FK rather than a readable
                          label — compare to the Medication column
                          just below, which uses the already-resolved
                          medication_name instead of a raw id. */}
                      <td>
                        {prescription.diagnosis}
                      </td>

                      <td>
                        {prescription.medication_name}
                      </td>

                      <td>
                        {prescription.dosage}
                      </td>

                      <td>
                        {prescription.frequency}
                      </td>

                      <td>
                        {prescription.duration} days
                      </td>

                      <td>
                        {prescription.instructions}
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

export default Prescription;