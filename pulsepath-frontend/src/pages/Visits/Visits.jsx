import { useEffect, useState } from "react";
import { FaNotesMedical, FaEye, FaSyncAlt } from "react-icons/fa";
import { getVisits } from "../../services/visitService";

function Visit() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getVisits();

      console.log("VISITS API RESPONSE:", data);

      setVisits(data.data?.results || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load visits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

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

        <button
          className="btn btn-outline-primary"
          onClick={loadVisits}
          disabled={loading}
        >
          <FaSyncAlt className="me-2" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Loading */}
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
