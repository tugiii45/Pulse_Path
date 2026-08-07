
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserTag,
} from "react-icons/fa";
import { registerUser } from "../../services/AuthService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        role: formData.role,
        password: formData.password,
      });

      navigate("/login");

    } catch (err) {
      console.error(err);

      const backendError =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Registration failed. Please check your information and try again.";

      setError(backendError);

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

          <div className="col-12 col-lg-9 col-xl-8">

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">

              <div className="row g-0">

                {/* Left branding section */}
                <div
                  className="col-lg-5 text-white p-5 d-flex flex-column justify-content-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #0d6efd, #087f8c)",
                  }}
                >

                  <div className="mb-4">
                    <FaHeartbeat size={42} />
                  </div>

                  <h2 className="fw-bold mb-3">
                    Join PulsePath
                  </h2>

                  <p className="mb-4 opacity-75">
                    Create your account and take the next step toward
                    connected, continuous healthcare.
                  </p>

                  <div className="d-flex align-items-start mb-3">
                    <FaHeartbeat className="me-3 mt-1" />

                    <div>
                      <div className="fw-semibold">
                        Connected Care
                      </div>

                      <small className="opacity-75">
                        Stay connected with your healthcare team.
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-start mb-3">
                    <FaUserTag className="me-3 mt-1" />

                    <div>
                      <div className="fw-semibold">
                        Personalized Access
                      </div>

                      <small className="opacity-75">
                        Get an experience suited to your role.
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <FaLock className="me-3 mt-1" />

                    <div>
                      <div className="fw-semibold">
                        Secure Account
                      </div>

                      <small className="opacity-75">
                        Your account credentials stay protected.
                      </small>
                    </div>
                  </div>

                </div>


                {/* Form section */}
                <div className="col-lg-7 bg-white p-4 p-md-5">

                  <div className="mb-4">

                    <h3 className="fw-bold mb-1">
                      Create your account
                    </h3>

                    <p className="text-muted mb-0">
                      Enter your details to get started.
                    </p>

                  </div>


                  {error && (
                    <div
                      className="alert alert-danger"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}


                  <form onSubmit={handleSubmit}>

                    {/* Name */}
                    <div className="row">

                      <div className="col-md-6 mb-3">

                        <label className="form-label fw-semibold">
                          First Name
                        </label>

                        <div className="input-group">

                          <span className="input-group-text bg-light">
                            <FaUser />
                          </span>

                          <input
                            type="text"
                            name="first_name"
                            className="form-control"
                            placeholder="Enter first name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                          />

                        </div>

                      </div>


                      <div className="col-md-6 mb-3">

                        <label className="form-label fw-semibold">
                          Last Name
                        </label>

                        <div className="input-group">

                          <span className="input-group-text bg-light">
                            <FaUser />
                          </span>

                          <input
                            type="text"
                            name="last_name"
                            className="form-control"
                            placeholder="Enter last name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                          />

                        </div>

                      </div>

                    </div>


                    {/* Email */}
                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Email Address
                      </label>

                      <div className="input-group">

                        <span className="input-group-text bg-light">
                          <FaEnvelope />
                        </span>

                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />

                      </div>

                    </div>


                    {/* Phone */}
                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Phone Number
                      </label>

                      <div className="input-group">

                        <span className="input-group-text bg-light">
                          <FaPhone />
                        </span>

                        <input
                          type="tel"
                          name="phone_number"
                          className="form-control"
                          placeholder="e.g. 0712345678"
                          value={formData.phone_number}
                          onChange={handleChange}
                          required
                        />

                      </div>

                    </div>


                    {/* Role */}
                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Account Role
                      </label>

                      <div className="input-group">

                        <span className="input-group-text bg-light">
                          <FaUserTag />
                        </span>

                        <select
                          name="role"
                          className="form-select"
                          value={formData.role}
                          onChange={handleChange}
                          required
                        >
                          <option value="">
                            Select your role
                          </option>

                          <option value="PATIENT">
                            Patient
                          </option>

                          <option value="DOCTOR">
                            Doctor
                          </option>

                          <option value="ADMIN">
                            Administrator
                          </option>

                        </select>

                      </div>

                      <small className="text-muted">
                        Select the role assigned to your PulsePath account.
                      </small>

                    </div>


                    {/* Password */}
                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Password
                      </label>

                      <div className="input-group">

                        <span className="input-group-text bg-light">
                          <FaLock />
                        </span>

                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="form-control"
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={8}
                        />

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                        >
                          {showPassword ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
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
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name="confirm_password"
                          className="form-control"
                          placeholder="Confirm your password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          required
                        />

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>

                      </div>

                    </div>


                    {/* Submit */}
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

                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>

                  </form>


                  {/* Login link */}
                  <div className="text-center mt-4">

                    <span className="text-muted">
                      Already have an account?
                    </span>{" "}

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

    </div>
  );
}

export default Register;

