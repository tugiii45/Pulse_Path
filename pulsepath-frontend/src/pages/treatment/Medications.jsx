import { useEffect, useState } from "react";
import {
  getMedications,
  createMedication,
} from "../../services/medicationService";

function Medications() {
  const [medications, setMedications] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    manufacturer: "",
    strength: "",
    dosage_form: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);

      const data = await getMedications();

      console.log("MEDICATIONS API RESPONSE:", data);

      setMedications(data.results || []);
    } catch (err) {
      console.error("Failed to load medications:", err);
      setError("Failed to load medications.");
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
        name: formData.name,
        generic_name: formData.generic_name,
        manufacturer: formData.manufacturer,
        strength: formData.strength,
        dosage_form: formData.dosage_form,
        description: formData.description,
      };

      const newMedication = await createMedication(data);

      console.log("NEW MEDICATION:", newMedication);

      setFormData({
        name: "",
        generic_name: "",
        manufacturer: "",
        strength: "",
        dosage_form: "",
        description: "",
      });

      await loadMedications();
    } catch (err) {
      console.error("Failed to create medication:", err);
      setError("Failed to create medication.");
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading medications...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Medications</h2>
          <p className="text-muted mb-0">
            Manage medications available for prescriptions.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Add Medication */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Add Medication</h5>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Medication Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="e.g. Panadol"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Generic Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Generic Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="generic_name"
                  placeholder="e.g. Paracetamol"
                  value={formData.generic_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Manufacturer */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Manufacturer
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="manufacturer"
                  placeholder="e.g. GSK"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Strength */}
              <div className="col-md-3 mb-3">
                <label className="form-label">
                  Strength
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="strength"
                  placeholder="e.g. 500 mg"
                  value={formData.strength}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Dosage Form */}
              <div className="col-md-3 mb-3">
                <label className="form-label">
                  Dosage Form
                </label>

                <select
                  className="form-select"
                  name="dosage_form"
                  value={formData.dosage_form}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select form
                  </option>

                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream">Cream</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Drops">Drops</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="col-12 mb-3">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-control"
                  name="description"
                  rows="3"
                  placeholder="Enter medication description..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Medication
            </button>

          </form>
        </div>
      </div>

      {/* Medication List */}
      <div className="card shadow-sm">

        <div className="card-header">
          <h5 className="mb-0">
            Medication List
          </h5>
        </div>

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover mb-0">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Generic Name</th>
                  <th>Manufacturer</th>
                  <th>Strength</th>
                  <th>Dosage Form</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>

                {medications.length > 0 ? (
                  medications.map((medication) => (
                    <tr key={medication.id}>

                      <td>{medication.id}</td>

                      <td>
                        <strong>
                          {medication.name}
                        </strong>
                      </td>

                      <td>
                        {medication.generic_name}
                      </td>

                      <td>
                        {medication.manufacturer}
                      </td>

                      <td>
                        {medication.strength}
                      </td>

                      <td>
                        {medication.dosage_form}
                      </td>

                      <td>
                        {medication.description}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4"
                    >
                      No medications found.
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

export default Medications;