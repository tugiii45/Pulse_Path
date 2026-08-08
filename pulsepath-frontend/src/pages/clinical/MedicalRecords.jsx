import { useEffect, useState } from "react";
import { FaFileMedical, FaEye, FaSyncAlt } from "react-icons/fa";
import { getClinicalRecords } from "../../services/ClinicalService";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClinicalRecords();

      setRecords(data.data?.results || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load medical records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FaFileMedical className="text-primary me-2" />
            Medical Records
          </h2>

          <p className="text-muted mb-0">
            View your clinical history and medical information.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadRecords}
          disabled={loading}
        >
          <FaSyncAlt className="me-2" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="text-muted mt-3">
            Loading medical records...
          </p>
        </div>
      ) : records.length === 0 ? (
        /* Empty State */
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FaFileMedical size={45} className="text-muted mb-3" />

            <h5 className="fw-bold">
              No medical records found
            </h5>

            <p className="text-muted mb-0">
              Your clinical records will appear here.
            </p>
          </div>
        </div>
      ) : (
        /* Records */
        <div className="row g-4">
          {records.map((record) => (
            <div className="col-md-6 col-xl-4" key={record.id}>
              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">
                        Medical Record
                      </h5>

                      <small className="text-muted">
                        Visit #{record.visit}
                      </small>
                    </div>

                    <FaFileMedical className="text-primary" size={24} />
                  </div>

                  <hr />

                  <p className="mb-2">
                    <strong>Patient:</strong>{" "}
                    {record.patient_name}
                  </p>

                  <p className="mb-2">
                    <strong>Allergies:</strong>{" "}
                    {record.allergies || "None recorded"}
                  </p>

                  <p className="mb-2">
                    <strong>Chronic Conditions:</strong>{" "}
                    {record.chronic_conditions || "None recorded"}
                  </p>

                  <p className="mb-2">
                    <strong>Current Medications:</strong>{" "}
                    {record.current_medications || "None recorded"}
                  </p>

                  <p className="mb-2">
                    <strong>Family History:</strong>{" "}
                    {record.family_history || "None recorded"}
                  </p>

                  <p className="text-muted small mt-3 mb-3">
                    Last updated:{" "}
                    {new Date(record.updated_at).toLocaleDateString()}
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

export default MedicalRecords;