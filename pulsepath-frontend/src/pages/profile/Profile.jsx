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

function Profile() {
  const { profile, loading: authLoading } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProfile();

      console.log("PROFILE API RESPONSE:", data);

      setUserProfile(data);

      setFormData({
        first_name: data?.first_name || "",
        last_name: data?.last_name || "",
        phone_number: data?.phone_number || "",
        address: data?.address || "",
      });
    } catch (err) {
      console.error("Unable to load profile:", err);
      setError("Unable to load profile information.");
    } finally {
      setLoading(false);
    }
  };

  const data = userProfile || profile;

  const role = data?.role?.toUpperCase() || "USER";

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

  const fullName =
    `${data?.first_name || ""} ${data?.last_name || ""}`.trim() || "User";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfilePicture(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setError("");
    setSuccess("");
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

  const handleCancel = () => {
    setEditing(false);
    setError("");
    setSuccess("");

    setFormData({
      first_name: data?.first_name || "",
      last_name: data?.last_name || "",
      phone_number: data?.phone_number || "",
      address: data?.address || "",
    });

    setProfilePicture(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const form = new FormData();

      form.append("first_name", formData.first_name);
      form.append("last_name", formData.last_name);
      form.append("phone_number", formData.phone_number);
      form.append("address", formData.address);

      if (profilePicture) {
        form.append("profile_picture", profilePicture);
      }

      const updatedProfile = await updateProfile(form);

      console.log("UPDATED PROFILE RESPONSE:", updatedProfile);

      setUserProfile(updatedProfile);

      setFormData({
        first_name: updatedProfile?.first_name || "",
        last_name: updatedProfile?.last_name || "",
        phone_number: updatedProfile?.phone_number || "",
        address: updatedProfile?.address || "",
      });

      setProfilePicture(null);
      setPreviewUrl("");
      setEditing(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess("Your profile has been updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Unable to update profile:", err);

      const responseData = err?.response?.data;

      if (responseData && typeof responseData === "object") {
        const messages = Object.entries(responseData)
          .map(([field, messages]) => {
            const value = Array.isArray(messages)
              ? messages.join(", ")
              : messages;

            return `${field}: ${value}`;
          })
          .join(" ");

        setError(messages || "Unable to update profile.");
      } else {
        setError("Unable to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const getMediaUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `http://127.0.0.1:8000${url}`;
  };

  const getProfileImage = () => {
    if (previewUrl) {
      return previewUrl;
    }

    if (data?.profile_picture) {
      return getMediaUrl(data.profile_picture);
    }

    return null;
  };

  const profileImage = getProfileImage();

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
      ========================== */}

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Profile</h2>

          <p className="text-muted mb-0">
            Manage your personal information and account details.
          </p>
        </div>

        {!editing ? (
          <button className="btn btn-primary mt-3 mt-md-0" onClick={handleEdit}>
            <FaEdit className="me-2" />
            Edit Profile
          </button>
        ) : (
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes className="me-2" />
              Cancel
            </button>

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
      ========================== */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start">
            {/* Profile Picture */}

            <div className="position-relative mb-3 mb-md-0 me-md-4">
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

            {/* User information */}

            <div className="text-center text-md-start flex-grow-1">
              <h3 className="fw-bold mb-1">{fullName}</h3>

              <p className="text-muted mb-2">
                {data?.email || "No email available"}
              </p>

              <span className="badge bg-primary px-3 py-2">
                {formatRole(role)}
              </span>

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

            {/* Account Status */}

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
      ========================== */}

      <form id="profile-form" onSubmit={handleSave}>
        <div className="row g-4">
          {/* =========================
              PERSONAL INFORMATION
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
                  {/* First Name */}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">First Name</label>

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

                  {/* Last Name */}

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

                  {/* Email */}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Email Address
                    </label>

                    <div className="fw-semibold">{data?.email || "-"}</div>

                    <small className="text-muted">
                      Email cannot be changed.
                    </small>
                  </div>

                  {/* Phone */}

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

                  {/* Address */}

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
          ========================== */}

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Account Summary</h5>

                {/* Role */}

                <div className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <FaShieldAlt className="text-primary me-3" size={20} />

                    <span className="text-muted">Role</span>
                  </div>

                  <div className="fw-semibold ms-4 ps-2">
                    {formatRole(role)}
                  </div>
                </div>

                {/* Hospital */}

                <div className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <FaHospital className="text-primary me-3" size={20} />

                    <span className="text-muted">Hospital</span>
                  </div>

                  <div className="fw-semibold ms-4 ps-2">
                    {data?.hospital_name || data?.hospital?.name || "-"}
                  </div>
                </div>

                {/* Department */}

                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaBriefcaseMedical
                      className="text-primary me-3"
                      size={20}
                    />

                    <span className="text-muted">Department</span>
                  </div>

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

            <span className="badge bg-success px-3 py-2">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
