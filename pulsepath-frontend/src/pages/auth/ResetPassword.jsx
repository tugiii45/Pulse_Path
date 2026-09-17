import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthLayout from "../../layouts/AuthLayout";
import { confirmPasswordReset } from "../../services/AuthService";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

function ResetPassword() {
  const navigate = useNavigate();
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!uidb64 || !token) {
      setError("This password reset link is invalid or incomplete.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset({ uidb64, token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "This password reset link is invalid or has expired."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="fw-bold mb-2">Choose a new password</h2>
      <p className="text-muted mb-4">Create a new password for your PulsePath account.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success ? (
        <div className="alert alert-success" role="alert">
          Password reset successfully. Taking you to sign in...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div className="input-group">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter a new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
            <div className="input-group">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary w-100 py-2" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}

      <p className="text-center mt-4 mb-0">
        <Link to="/login" className="text-decoration-none fw-bold">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default ResetPassword;
