import { useEffect, useState } from "react";
import { getDiagnoses } from "../../services/diagnosisService";
import {
  getMedications,
} from "../../services/medicationService";
import {
  getPrescriptions,
  createPrescription,
} from "../../services/prescriptionService";

function Prescriptions() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [formData, setFormData] = useState({
    diagnosis: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [diagnosisData, medicationData, prescriptionData] =
        await Promise.all([
          getDiagnoses(),
          getMedications(),
          getPrescriptions(),
        ]);

      console.log("DIAGNOSES:", diagnosisData);
      console.log("MEDICATIONS:", medicationData);
      console.log("PRESCRIPTIONS:", prescriptionData);

      setDiagnoses(diagnosisData.results || []);
      setMedications(medicationData.results || []);
      setPrescriptions(prescriptionData.results || []);
    } catch (err) {
      console.error("Failed to load prescription data:", err);
      setError("Failed to load prescription data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const data = {
        diagnosis: Number(formData.diagnosis),
        medication: Number(formData.medication),
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: Number(formData.duration),
        instructions: formData.instructions,
      };

      const newPrescription = await createPrescription(data);

      console.log("NEW PRESCRIPTION:", newPrescription);

      setFormData({
        diagnosis: "",
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });

      loadData();
    } catch (err) {
      console.error("Failed to create prescription:", err);
      setError("Failed to create prescription.");
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Prescriptions</h2>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Add Prescription */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Add Prescription</h5>
        </div>

        <div className="card-body">
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
                      {diagnosis.condition} -{" "}
                      {diagnosis.icd10_code}
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
                      {medication.name}{" "}
                      {medication.strength
                        ? `- ${medication.strength}`
                        : ""}
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
                  placeholder="e.g. 500 mg"
                  value={formData.dosage}
                  onChange={handleChange}
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
                  placeholder="e.g. Twice per day"
                  value={formData.frequency}
                  onChange={handleChange}
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
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Instructions */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Instructions
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="instructions"
                  placeholder="e.g. Take after meals"
                  value={formData.instructions}
                  onChange={handleChange}
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

      {/* Prescription List */}
      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">Prescription Records</h5>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">

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
                {prescriptions.length > 0 ? (
                  prescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>{prescription.id}</td>

                      <td>
                        {prescription.diagnosis}
                      </td>

                      <td>
                        {prescription.medication}
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
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4"
                    >
                      No prescriptions found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Prescriptions;