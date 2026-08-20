import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaHeartbeat, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { setPassword as setPasswordRequest } from "../../services/AuthService";

/**
 * Destination page for the "set your password" link in a doctor's
 * invite email. Route: /set-password/:uidb64/:token/
 *
 * The uidb64/token pair identifies and authorizes this specific
 * account activation -- the page itself requires no login, since the
 * token IS the credential proving the visitor owns the invite email.
 */
function SetPassword() {
  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!uidb64 || !token) {
      setError(
        "This invite link is missing information and can't be used. Please ask your administrator to resend it.",
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await setPasswordRequest({ uidb64, token, password });

      setSuccess(true);

      // Give the person a moment to see the confirmation before
      // sending them to log in with their new password.
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);

      const backendError =
        err.response?.data?.errors?.detail ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "This invite link is invalid or has expired. Please ask your administrator to resend it.";

      setError(
        typeof backendError === "string"
          ? backendError
          : "This invite link is invalid or has expired. Please ask your administrator to resend it.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center py-5"
      style={{
        background:
          "linear-gradient(135deg, #f3f8ff 0%, #ffffff 55%, #eefaf6 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-7 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: 64,
                      height: 64,
                      background: "linear-gradient(135deg, #0d6efd, #087f8c)",
                      color: "#fff",
                    }}
                  >
                    <FaHeartbeat size={28} />
                  </div>

                  <h3 className="fw-bold mb-1">Activate your account</h3>

                  <p className="text-muted mb-0">
                    Set a password to finish setting up your PulsePath
                    account.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {success ? (
                  <div className="alert alert-success" role="alert">
                    Password set successfully. Taking you to the login
                    page...
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* New Password */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        New Password
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaLock />
                        </span>

                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => {
                            setPasswordValue(e.target.value);
                            setError("");
                          }}
                          required
                          minLength={8}
                        />

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      <small className="text-muted">
                        Use at least 8 characters.
                      </small>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Confirm Password
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaLock />
                        </span>

                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError("");
                          }}
                          required
                        />

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-3 fw-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Activating...
                        </>
                      ) : (
                        "Set Password & Activate Account"
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center mt-4">
                  <span className="text-muted">Already activated?</span>{" "}
                  <Link
                    to="/login"
                    className="text-primary fw-semibold text-decoration-none"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetPassword;