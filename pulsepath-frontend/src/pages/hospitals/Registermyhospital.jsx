import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHospital } from "react-icons/fa";
import { registerHospital } from "../../services/hospitalService";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Admin self-service hospital registration.
 *
 * Shown to an ADMIN user who has no hospital yet (see
 * SuperAdminCreateAdminView / HospitalRegisterView on the backend).
 * Unlike Hospitals.jsx (superadmin-only management panel), this is a
 * one-time form: no list, no edit/delete, just "register your hospital
 * and get linked to it."
 *
 * On success, refreshes the auth profile (so profile.hospital is no
 * longer null) and sends the admin into their normal dashboard.
 */
function RegisterMyHospital() {
  const navigate = useNavigate();
  const { reloadProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      setSaving(true);
      setError("");

      await registerHospital(formData);

      // Refresh the auth profile so profile.hospital is no longer
      // null, then leave this page for good — ProtectedRoute would
      // otherwise keep sending the admin back here.
      await reloadProfile();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Failed to register hospital:", err);

      const detail =
        err.response?.data?.detail ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.email?.[0] ||
        "Failed to register hospital.";

      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div
        className="row justify-content-center"
        style={{ maxWidth: "700px", margin: "0 auto" }}
      >
        <div className="col-12">
          <div className="text-center mb-4">
            <div
              className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "56px", height: "56px" }}
            >
              <FaHospital size={24} />
            </div>

            <h2 className="fw-bold mb-1">Register Your Hospital</h2>

            <p className="text-muted mb-0">
              You'll be linked to this hospital as its administrator.
              This can only be done once.
            </p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Hospital Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter hospital name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hospital@example.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter hospital address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={saving}
                >
                  {saving ? "Registering..." : "Register Hospital"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterMyHospital;