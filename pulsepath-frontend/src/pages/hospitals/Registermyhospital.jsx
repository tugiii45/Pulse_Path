import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHospital } from "react-icons/fa";
import { registerHospital } from "../../services/hospitalService";
import { useAuth } from "../../contexts/AuthContext";

/**
 * RegisterMyHospital Page
 *
 * Allows an ADMIN who is not yet linked to a hospital
 * to register their hospital.
 *
 * This is a one-time registration process.
 *
 * After successful registration:
 * 1. The hospital is created through the backend.
 * 2. The authenticated user's profile is refreshed.
 * 3. The admin is redirected to the dashboard.
 */
function RegisterMyHospital() {

  // React Router navigation function used to redirect
  // the administrator after successful registration.
  const navigate = useNavigate();

  // reloadProfile refreshes the authenticated user's profile
  // after the hospital has been successfully registered.
  const { reloadProfile } = useAuth();

  // Stores the values entered into the hospital registration form.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Tracks whether the registration request is currently running.
  const [saving, setSaving] = useState(false);

  // Stores an error message returned by the backend.
  const [error, setError] = useState("");

  /**
   * Handle changes to the hospital registration fields.
   *
   * The input's "name" attribute determines which property
   * in formData gets updated.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /**
   * Submit the hospital registration form.
   *
   * The form data is sent to the backend using registerHospital().
   * If registration succeeds, the authenticated profile is refreshed
   * and the admin is redirected to the dashboard.
   */
  const handleSubmit = async (e) => {
    // Prevent the browser from performing a normal page reload.
    e.preventDefault();

    try {
      // Show the saving state and clear any previous error.
      setSaving(true);
      setError("");

      // Send the hospital registration information to the backend.
      await registerHospital(formData);

      /**
       * Refresh the authenticated user's profile.
       *
       * Before registration, the admin may have:
       *
       * profile.hospital === null
       *
       * After registration, the refreshed profile should contain
       * the newly registered hospital.
       *
       * This is important because ProtectedRoute uses the profile
       * information to determine whether the admin should remain
       * on this page.
       */
      await reloadProfile();

      // Send the admin to the normal dashboard.
      //
      // "replace: true" prevents the hospital registration page
      // from remaining in the browser history.
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Failed to register hospital:", err);

      /**
       * Extract the most useful error message from the backend.
       *
       * Priority:
       * 1. General detail message
       * 2. Hospital name validation error
       * 3. Hospital email validation error
       * 4. Generic fallback message
       */
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.email?.[0] ||
        "Failed to register hospital.";

      // Display the backend error to the user.
      setError(detail);

    } finally {
      // Stop the saving indicator regardless of success or failure.
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* =========================
          PAGE CONTAINER
          Centers the registration
          form and limits its width.
      ========================== */}

      <div
        className="row justify-content-center"
        style={{ maxWidth: "700px", margin: "0 auto" }}
      >
        <div className="col-12">

          {/* =========================
              PAGE HEADER
              Displays the hospital icon,
              title, and description.
          ========================== */}

          <div className="text-center mb-4">

            {/* Hospital icon displayed above the title. */}
            <div
              className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "56px", height: "56px" }}
            >
              <FaHospital size={24} />
            </div>

            <h2 className="fw-bold mb-1">
              Register Your Hospital
            </h2>

            <p className="text-muted mb-0">
              You'll be linked to this hospital as its administrator.
              This can only be done once.
            </p>

          </div>

          {/* =========================
              ERROR ALERT
              Displayed when hospital
              registration fails.
          ========================== */}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {/* =========================
              REGISTRATION CARD
              Contains the hospital
              registration form.
          ========================== */}

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <form onSubmit={handleSubmit}>

                {/* =========================
                    HOSPITAL NAME
                ========================== */}

                <div className="mb-3">

                  <label className="form-label">
                    Hospital Name
                  </label>

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

                {/* =========================
                    HOSPITAL EMAIL
                ========================== */}

                <div className="mb-3">

                  <label className="form-label">
                    Email
                  </label>

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

                {/* =========================
                    HOSPITAL PHONE
                ========================== */}

                <div className="mb-3">

                  <label className="form-label">
                    Phone
                  </label>

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

                {/* =========================
                    HOSPITAL ADDRESS
                ========================== */}

                <div className="mb-3">

                  <label className="form-label">
                    Address
                  </label>

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

                {/* =========================
                    SUBMIT BUTTON
                ========================== */}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={saving}
                >
                  {/* Change the button text while the
                      registration request is running. */}
                  {saving
                    ? "Registering..."
                    : "Register Hospital"}
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

