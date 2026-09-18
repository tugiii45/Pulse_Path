// Collects an email address and starts the secure password-recovery flow.
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { requestPasswordReset } from "../../services/AuthService";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Clear stale feedback before starting a new request.
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // The backend intentionally returns a generic message for both known
      // and unknown emails, preventing account enumeration.
      const response = await requestPasswordReset(email);
      setSuccess(response?.detail || "If an account exists for that email, a password reset link has been sent.");
    } catch (err) {
      // Convert API validation/network errors into messages suitable for users.
      setError(getFriendlyErrorMessage(err, "We could not process that request. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="fw-bold mb-2">Reset your password</h2>
      <p className="text-muted mb-4">
        Enter your email and we will send you a link to choose a new password.
      </p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="reset-email">Email Address</label>
          <input
            id="reset-email"
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary w-100 py-2" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-center mt-4 mb-0">
        <Link to="/login" className="text-decoration-none fw-bold">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;
