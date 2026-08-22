import { useEffect, useState } from "react";
import { getHospitals } from "../../services/hospitalService";
import { createAdmin } from "../../services/adminService";

function SuperAdminDashboard() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  // --------------------------------------------------
  // LOAD HOSPITALS
  // --------------------------------------------------

  const loadHospitals = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getHospitals();

      // getHospitals() returns the full paginated payload
      // ({results, count, next, previous}), not a flat array.
      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];

      setHospitals(results);
    } catch (err) {
      console.error("Unable to load hospitals:", err);
      setError("Unable to load hospitals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  // --------------------------------------------------
  // CREATE ADMIN FORM
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
    });

    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
      };

      const result = await createAdmin(payload);

      const warning = result?.warning;

      setSuccessMessage(
        warning
          ? `Admin account created for ${payload.email}, but the invite email failed to send. Please resend it manually.`
          : `Admin account created for ${payload.email}. An invite email has been sent so they can set their password.`
      );

      resetForm();
    } catch (err) {
      console.error(
        "Unable to create admin:",
        err.response?.data || err
      );

      const apiError = err.response?.data;

      if (apiError?.email) {
        setError(
          Array.isArray(apiError.email)
            ? apiError.email.join(" ")
            : apiError.email
        );
      } else if (apiError?.detail) {
        setError(apiError.detail);
      } else {
        setError("Unable to create admin account.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="container-fluid py-4">

      {/* PAGE HEADING */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Platform Overview</h2>
          <p className="text-muted mb-0">
            Manage hospitals and hospital administrators.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setSuccessMessage("");
            setError("");
            setShowForm(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Create Admin
        </button>
      </div>

      {/* MESSAGES */}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* CREATE ADMIN FORM */}
      {/* --------------------------------------------- */}

      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">

            <h5 className="card-title mb-1">
              Create Hospital Administrator
            </h5>

            <small className="text-muted d-block mb-4">
              The new admin will receive an email invite to set their
              password. They register their own hospital after
              logging in for the first time.
            </small>

            <form onSubmit={handleSubmit}>
              <div className="row">

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    className="form-control"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Admin"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* HOSPITALS TABLE */}
      {/* --------------------------------------------- */}

      <div className="card shadow-sm">
        <div className="card-body">

          <h5 className="card-title mb-3">Hospitals</h5>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="text-center text-muted py-4">
              No hospitals have been registered yet. Once an admin
              logs in and registers their hospital, it will appear
              here.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {hospitals.map((hospital) => (
                    <tr key={hospital.id}>
                      <td className="fw-semibold">{hospital.name}</td>
                      <td>{hospital.email}</td>
                      <td>{hospital.phone}</td>
                      <td>
                        <div
                          style={{
                            maxWidth: "260px",
                            whiteSpace: "normal",
                          }}
                        >
                          {hospital.address}
                        </div>
                      </td>
                      <td>
                        {hospital.is_active ? (
                          <span className="badge bg-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        {hospital.created_at
                          ? new Date(
                              hospital.created_at
                            ).toLocaleDateString()
                          : "-"}
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

export default SuperAdminDashboard;