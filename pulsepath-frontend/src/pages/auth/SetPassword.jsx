import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!uid || !token) {
      setError("Invalid or incomplete invitation link.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("set-password/", {
        uid,
        token,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      setSuccess(
        "Your password has been set successfully. You can now log in."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const responseErrors = err.response?.data?.errors;

      setError(
        responseErrors?.token?.[0] ||
          responseErrors?.confirm_password?.[0] ||
          responseErrors?.password?.[0] ||
          err.response?.data?.message ||
          "Unable to set your password. The invitation may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Set Your Password</h2>
                <p className="text-muted mb-0">
                  Create a password for your PulsePath doctor account.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    required
                    disabled={loading || !!success}
                  />
                  <small className="text-muted">
                    Password must contain at least 8 characters.
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    className="form-control"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    minLength={8}
                    required
                    disabled={loading || !!success}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading || !!success}
                >
                  {loading ? "Setting Password..." : "Set Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetPassword;