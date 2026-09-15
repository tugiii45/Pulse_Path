
import { useEffect, useRef, useState } from "react";
import {
  FaUserCircle,
  FaHospital,
  FaBriefcaseMedical,
  FaShieldAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaTrash,
} from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";
import { getProfile, updateProfile } from "../../services/profileService";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

/**
 * Profile Page
 *
 * Allows authenticated users to:
 * - View their profile information
 * - Edit their personal information
 * - Upload a new profile picture
 * - Preview a selected profile picture before saving
 * - Save profile changes
 * - Cancel changes
 *
 * The page also displays read-only account information such as:
 * - Email
 * - Role
 * - Hospital
 * - Department
 * - Account status
 */
function Profile() {
  // Get the authenticated user's profile and authentication loading state
  // from the global AuthContext.
  const { profile, loading: authLoading } = useAuth();

  // Stores the profile returned directly from the profile API.
  // This takes priority over the profile supplied by AuthContext.
  const [userProfile, setUserProfile] = useState(null);

  // Stores the editable profile fields used by the form.
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
  });

  // Stores the newly selected profile picture file.
  const [profilePicture, setProfilePicture] = useState(null);

  // Stores a temporary browser URL used to preview the selected picture.
  const [previewUrl, setPreviewUrl] = useState("");

  // Controls whether the profile is currently in edit mode.
  const [editing, setEditing] = useState(false);

  // Controls the initial profile loading state.
  const [loading, setLoading] = useState(true);

  // Controls the saving state while an update request is being processed.
  const [saving, setSaving] = useState(false);

  // Stores an error message displayed to the user.
  const [error, setError] = useState("");

  // Stores a success message displayed after a successful update.
  const [success, setSuccess] = useState("");

  // Reference to the hidden file input used for selecting a profile picture.
  const fileInputRef = useRef(null);

  /**
   * Load the user's profile when the component first mounts.
   */
  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * Fetch the authenticated user's profile from the backend.
   *
   * The returned profile is stored locally so that the page can
   * display the latest information returned by the API.
   */
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // Request the current user's profile from the backend.
      const data = await getProfile();

      console.log("PROFILE API RESPONSE:", data);

      // Store the complete profile response.
      setUserProfile(data);

      // Populate the editable form fields with the API data.
      setFormData({
        first_name: data?.first_name || "",
        last_name: data?.last_name || "",
        phone_number: data?.phone_number || "",
        address: data?.address || "",
      });
    } catch (err) {
      console.error("Unable to load profile:", err);

      // Display a user-friendly error instead of exposing
      // the technical API error directly.
      setError(getFriendlyErrorMessage(err, "Unable to load your profile. Please check your connection and try again."));
    } finally {
      // Stop displaying the loading state regardless of success or failure.
      setLoading(false);
    }
  };

  // Prefer the freshly loaded API profile.
  // If it has not loaded yet, fall back to the AuthContext profile.
  const data = userProfile || profile;

  // Convert the role to uppercase so role comparisons are consistent.
  const role = data?.role?.toUpperCase() || "USER";

  /**
   * Convert the backend role value into a user-friendly label.
   */
  const formatRole = (roleValue) => {
    switch (roleValue) {
      case "ADMIN":
        return "Administrator";

      case "DOCTOR":
        return "Doctor";

      case "PATIENT":
        return "Patient";

      default:
        return roleValue.charAt(0) + roleValue.slice(1).toLowerCase();
    }
  };

  /**
   * Generate initials to display when the user does not have
   * a profile picture.
   *
   * Examples:
   * - John Doe -> JD
   * - John -> J
   * - john@example.com -> J
   * - No information -> U
   */
  const getInitials = () => {
    const firstName = data?.first_name || "";
    const lastName = data?.last_name || "";

    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    if (data?.email) {
      return data.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  // Build the user's full name from their first and last names.
  // Fall back to "User" if neither is available.
  const fullName =
    `${data?.first_name || ""} ${data?.last_name || ""}`.trim() || "User";

  /**
   * Handle changes to text-based form fields.
   *
   * Uses the input's "name" attribute to determine which
   * property in formData should be updated.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /**
   * Handle selection of a new profile picture.
   *
   * The selected file is stored in state and a temporary
   * browser URL is created so the user can preview it
   * before saving.
   */
  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];

    // Do nothing if no file was selected.
    if (!file) {
      return;
    }

    // Store the selected image file for the eventual API request.
    setProfilePicture(file);

    // Create a temporary URL for displaying the image preview.
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Clear any previous messages.
    setError("");
    setSuccess("");
  };

  /**
   * Remove the currently selected profile picture.
   *
   * This only removes the newly selected file from the form.
   * It does not delete an already saved profile picture from
   * the backend.
   */
  const handleRemovePicture = () => {
    setProfilePicture(null);
    setPreviewUrl("");

    // Reset the file input so the same file can be selected again if needed.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Enter profile editing mode.
   *
   * The current profile values are copied into the editable form
   * so the user starts editing from the latest saved information.
   */
  const handleEdit = () => {
    setEditing(true);
    setError("");
    setSuccess("");

    setFormData({
      first_name: data?.first_name || "",
      last_name: data?.last_name || "",
      phone_number: data?.phone_number || "",
      address: data?.address || "",
    });
  };

  /**
   * Cancel profile editing.
   *
   * Restores the form fields to the currently saved profile values
   * and clears any newly selected profile picture.
   */
  const handleCancel = () => {
    setEditing(false);
    setError("");
    setSuccess("");

    // Restore the saved profile information.
    setFormData({
      first_name: data?.first_name || "",
      last_name: data?.last_name || "",
      phone_number: data?.phone_number || "",
      address: data?.address || "",
    });

    // Clear any selected image that has not been saved yet.
    setProfilePicture(null);
    setPreviewUrl("");

    // Reset the hidden file input.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Save the edited profile information.
   *
   * FormData is used because the request can contain both
   * normal text fields and an optional image file.
   */
  const handleSave = async (event) => {
    // Prevent the browser from performing a normal form submission.
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Create a multipart form payload.
      const form = new FormData();

      // Add editable profile fields to the request.
      form.append("first_name", formData.first_name);
      form.append("last_name", formData.last_name);
      form.append("phone_number", formData.phone_number);
      form.append("address", formData.address);

      // Add the image only when the user selected a new one.
      if (profilePicture) {
        form.append("profile_picture", profilePicture);
      }

      // Send the updated profile to the backend.
      const updatedProfile = await updateProfile(form);

      console.log("UPDATED PROFILE RESPONSE:", updatedProfile);

      // Replace the local profile with the updated API response.
      setUserProfile(updatedProfile);

      // Refresh the form fields using the updated profile.
      setFormData({
        first_name: updatedProfile?.first_name || "",
        last_name: updatedProfile?.last_name || "",
        phone_number: updatedProfile?.phone_number || "",
        address: updatedProfile?.address || "",
      });

      // Clear the temporary image selection and preview.
      setProfilePicture(null);
      setPreviewUrl("");

      // Exit edit mode after a successful update.
      setEditing(false);

      // Reset the file input.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Tell the user that the update was successful.
      setSuccess("Your profile has been updated successfully.");

      // Automatically remove the success message after 4 seconds.
      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Unable to update profile:", err);

      setError(getFriendlyErrorMessage(err, "Unable to update your profile. Please check your name, phone number, address, and profile picture."));
    } finally {
      // Always stop the saving indicator when the request finishes.
      setSaving(false);
    }
  };

  /**
   * Convert a relative media URL returned by Django into
   * a complete URL that the browser can load.
   *
   * Absolute URLs are returned unchanged.
   */
  const getMediaUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `http://127.0.0.1:8000${url}`;
  };

  /**
   * Determine which image should currently be displayed.
   *
   * Priority:
   * 1. Newly selected image preview
   * 2. Existing saved profile picture
   * 3. No image, so initials will be displayed
   */
  const getProfileImage = () => {
    if (previewUrl) {
      return previewUrl;
    }

    if (data?.profile_picture) {
      return getMediaUrl(data.profile_picture);
    }

    return null;
  };

  // Get the final image URL used by the profile picture section.
  const profileImage = getProfileImage();

  /**
   * Display a loading screen while authentication information
   * or profile information is still being loaded.
   */
  if (authLoading || loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="text-muted mb-0">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* =========================
          PAGE HEADER
          Displays the page title and
          edit/save/cancel controls.
      ========================== */}

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Profile</h2>

          <p className="text-muted mb-0">
            Manage your personal information and account details.
          </p>
        </div>

        {/* Show Edit Profile when not editing.
            Show Cancel and Save Changes when editing. */}
        {!editing ? (
          <button className="btn btn-primary mt-3 mt-md-0" onClick={handleEdit}>
            <FaEdit className="me-2" />
            Edit Profile
          </button>
        ) : (
          <div className="d-flex gap-2 mt-3 mt-md-0">
            {/* Cancel editing without saving changes. */}
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes className="me-2" />
              Cancel
            </button>

            {/* Submit the profile form.
                The form itself is located further down the page,
                so the "form" attribute connects this button to it. */}
            <button
              type="submit"
              form="profile-form"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* =========================
          ALERTS
          Displays backend errors and
          successful update messages.
      ========================== */}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      {/* =========================
          PROFILE HEADER
          Displays the user's profile
          picture, name, email, role,
          and account status.
      ========================== */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start">
            {/* =========================
                PROFILE PICTURE
            ========================== */}

            <div className="position-relative mb-3 mb-md-0 me-md-4">
              {/* Display the selected/saved image when available.
                  Otherwise display generated initials. */}
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="rounded-circle border"
                  style={{
                    width: "110px",
                    height: "110px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: "110px",
                    height: "110px",
                    fontSize: "34px",
                  }}
                >
                  {getInitials()}
                </div>
              )}

              {/* Show the camera button and hidden file input
                  only while editing the profile. */}
              {editing && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0"
                    style={{
                      width: "36px",
                      height: "36px",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile picture"
                  >
                    <FaCamera size={14} />
                  </button>

                  {/* Hidden file input triggered by the camera button. */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handlePictureChange}
                  />
                </>
              )}
            </div>

            {/* =========================
                USER INFORMATION
            ========================== */}

            <div className="text-center text-md-start flex-grow-1">
              <h3 className="fw-bold mb-1">{fullName}</h3>

              <p className="text-muted mb-2">
                {data?.email || "No email available"}
              </p>

              {/* Display the user's role as a badge. */}
              <span className="badge bg-primary px-3 py-2">
                {formatRole(role)}
              </span>

              {/* When editing, allow the user to remove
                  the newly selected image before saving. */}
              {editing && profilePicture && (
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={handleRemovePicture}
                  >
                    <FaTrash className="me-1" />
                    Remove selected picture
                  </button>
                </div>
              )}
            </div>

            {/* =========================
                ACCOUNT STATUS
            ========================== */}

            <div className="mt-3 mt-md-0">
              <div className="d-flex align-items-center">
                <span
                  className="bg-success rounded-circle me-2"
                  style={{
                    width: "9px",
                    height: "9px",
                  }}
                />

                <span className="text-muted small">Active Account</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          PROFILE FORM
          Contains editable personal
          information and read-only
          account information.
      ========================== */}

      <form id="profile-form" onSubmit={handleSave}>
        <div className="row g-4">
          {/* =========================
              PERSONAL INFORMATION
              Editable profile fields.
          ========================== */}

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-light rounded p-2 me-3">
                    <FaUserCircle className="text-primary" size={22} />
                  </div>

                  <div>
                    <h5 className="fw-bold mb-0">Personal Information</h5>

                    <small className="text-muted">
                      Your basic account information
                    </small>
                  </div>
                </div>

                <div className="row g-4">
                  {/* =========================
                      FIRST NAME
                  ========================== */}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">First Name</label>

                    {/* Display an input while editing,
                        otherwise display the saved value. */}
                    {editing ? (
                      <input
                        type="text"
                        name="first_name"
                        className="form-control"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    ) : (
                      <div className="fw-semibold">
                        {data?.first_name || "-"}
                      </div>
                    )}
                  </div>

                  {/* =========================
                      LAST NAME
                  ========================== */}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Last Name</label>

                    {editing ? (
                      <input
                        type="text"
                        name="last_name"
                        className="form-control"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    ) : (
                      <div className="fw-semibold">
                        {data?.last_name || "-"}
                      </div>
                    )}
                  </div>

                  {/* =========================
                      EMAIL ADDRESS
                      Email is intentionally
                      read-only.
                  ========================== */}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Email Address
                    </label>

                    <div className="fw-semibold">{data?.email || "-"}</div>

                    <small className="text-muted">
                      Email cannot be changed.
                    </small>
                  </div>

                  {/* =========================
                      PHONE NUMBER
                  ========================== */}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Phone Number
                    </label>

                    {editing ? (
                      <input
                        type="tel"
                        name="phone_number"
                        className="form-control"
                        value={formData.phone_number}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="fw-semibold">
                        {data?.phone_number || "-"}
                      </div>
                    )}
                  </div>

                  {/* =========================
                      ADDRESS
                  ========================== */}

                  <div className="col-12">
                    <label className="form-label fw-semibold">Address</label>

                    {editing ? (
                      <textarea
                        name="address"
                        className="form-control"
                        rows="3"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                      />
                    ) : (
                      <div className="fw-semibold">{data?.address || "-"}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              ACCOUNT SUMMARY
              Displays read-only account
              and organizational details.
          ========================== */}

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Account Summary</h5>

                {/* =========================
                    ROLE
                ========================== */}

                <div className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <FaShieldAlt className="text-primary me-3" size={20} />

                    <span className="text-muted">Role</span>
                  </div>

                  <div className="fw-semibold ms-4 ps-2">
                    {formatRole(role)}
                  </div>
                </div>

                {/* =========================
                    HOSPITAL
                ========================== */}

                <div className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <FaHospital className="text-primary me-3" size={20} />

                    <span className="text-muted">Hospital</span>
                  </div>

                  {/* Supports both a direct hospital_name field
                      and a nested hospital.name field. */}
                  <div className="fw-semibold ms-4 ps-2">
                    {data?.hospital_name || data?.hospital?.name || "-"}
                  </div>
                </div>

                {/* =========================
                    DEPARTMENT
                ========================== */}

                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaBriefcaseMedical
                      className="text-primary me-3"
                      size={20}
                    />

                    <span className="text-muted">Department</span>
                  </div>

                  {/* Supports both a direct department_name field
                      and a nested department.name field. */}
                  <div className="fw-semibold ms-4 ps-2">
                    {data?.department_name || data?.department?.name || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* =========================
          SECURITY CARD
          Provides a simple visual
          confirmation that the account
          is protected by authentication.
      ========================== */}

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center">
            <div className="bg-light rounded p-2 me-3">
              <FaShieldAlt className="text-primary" size={22} />
            </div>

            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1">Account Security</h5>

              <p className="text-muted mb-0">
                Your account is protected by authenticated access to the
                PulsePath system.
              </p>
            </div>

            {/* Visual security status indicator. */}
            <span className="badge bg-success px-3 py-2">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

