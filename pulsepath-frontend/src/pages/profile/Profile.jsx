import { useEffect, useState } from "react";
import { FaUserCircle, FaHospital, FaBriefcaseMedical, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { getProfile } from "../../services/profileService";

function Profile() {
  const { profile, loading: authLoading } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("profile/");

      const data =
        response?.data?.data ?? response?.data;

      console.log("PROFILE API RESPONSE:", data);

      setUserProfile(data);
    } catch (error) {
      console.error("Unable to load profile:", error);
      setError("Unable to load profile information.");
    } finally {
      setLoading(false);
    }
  };

  const data = userProfile || profile;

  const role = data?.role?.toUpperCase() || "USER";

  const formatRole = (role) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "DOCTOR":
        return "Doctor";
      case "PATIENT":
        return "Patient";
      default:
        return role.charAt(0) + role.slice(1).toLowerCase();
    }
  };

  const getInitials = () => {
    const firstName = data?.first_name || "";
    const lastName = data?.last_name || "";

    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    if (data?.username) {
      return data.username.charAt(0).toUpperCase();
    }

    if (data?.email) {
      return data.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  const fullName =
    `${data?.first_name || ""} ${data?.last_name || ""}`.trim() ||
    data?.username ||
    "User";

  if (authLoading || loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          ></div>

          <p className="text-muted mb-0">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          My Profile
        </h2>

        <p className="text-muted mb-0">
          View your account information and profile details.
        </p>
      </div>

      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* =========================
          PROFILE HEADER CARD
      ========================== */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">

          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start">

            {/* Avatar */}

            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold mb-3 mb-md-0 me-md-4"
              style={{
                width: "100px",
                height: "100px",
                fontSize: "32px",
                flexShrink: 0,
              }}
            >
              {getInitials()}
            </div>

            {/* User information */}

            <div className="text-center text-md-start flex-grow-1">

              <h3 className="fw-bold mb-1">
                {fullName}
              </h3>

              <p className="text-muted mb-2">
                {data?.email || "No email available"}
              </p>

              <span className="badge bg-primary px-3 py-2">
                {formatRole(role)}
              </span>

            </div>

            {/* Account status */}

            <div className="mt-3 mt-md-0">

              <div className="d-flex align-items-center">

                <span
                  className="bg-success rounded-circle me-2"
                  style={{
                    width: "9px",
                    height: "9px",
                  }}
                ></span>

                <span className="text-muted small">
                  Active Account
                </span>

              </div>

            </div>

          </div>

        </div>
      </div>

      <div className="row g-4">

        {/* =========================
            PERSONAL INFORMATION
        ========================== */}

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <div className="d-flex align-items-center mb-4">

                <div className="bg-light rounded p-2 me-3">
                  <FaUserCircle
                    className="text-primary"
                    size={22}
                  />
                </div>

                <div>
                  <h5 className="fw-bold mb-0">
                    Personal Information
                  </h5>

                  <small className="text-muted">
                    Your basic account information
                  </small>
                </div>

              </div>

              <div className="row g-4">

                {/* First Name */}

                <div className="col-md-6">

                  <label className="text-muted small mb-1">
                    First Name
                  </label>

                  <div className="fw-semibold">
                    {data?.first_name || "-"}
                  </div>

                </div>

                {/* Last Name */}

                <div className="col-md-6">

                  <label className="text-muted small mb-1">
                    Last Name
                  </label>

                  <div className="fw-semibold">
                    {data?.last_name || "-"}
                  </div>

                </div>

                {/* Username */}

                <div className="col-md-6">

                  <label className="text-muted small mb-1">
                    Username
                  </label>

                  <div className="fw-semibold">
                    {data?.username || "-"}
                  </div>

                </div>

                {/* Email */}

                <div className="col-md-6">

                  <label className="text-muted small mb-1">
                    Email Address
                  </label>

                  <div className="fw-semibold">
                    {data?.email || "-"}
                  </div>

                </div>

                {/* Phone */}

                <div className="col-md-6">

                  <label className="text-muted small mb-1">
                    Phone Number
                  </label>

                  <div className="fw-semibold">
                    {data?.phone || "-"}
                  </div>

                </div>

                {/* Role */}

                <div className="col-md-6">

                  <label className="text-muted small mb-1">
                    Account Role
                  </label>

                  <div className="fw-semibold">
                    {formatRole(role)}
                  </div>

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

              <h5 className="fw-bold mb-4">
                Account Summary
              </h5>

              <div className="mb-4">

                <div className="d-flex align-items-center mb-2">

                  <FaShieldAlt
                    className="text-primary me-3"
                    size={20}
                  />

                  <span className="text-muted">
                    Role
                  </span>

                </div>

                <div className="fw-semibold ms-4 ps-2">
                  {formatRole(role)}
                </div>

              </div>

              <div className="mb-4">

                <div className="d-flex align-items-center mb-2">

                  <FaHospital
                    className="text-primary me-3"
                    size={20}
                  />

                  <span className="text-muted">
                    Hospital
                  </span>

                </div>

                <div className="fw-semibold ms-4 ps-2">
                  {data?.hospital_name ||
                    data?.hospital?.name ||
                    "-"}
                </div>

              </div>

              <div>

                <div className="d-flex align-items-center mb-2">

                  <FaBriefcaseMedical
                    className="text-primary me-3"
                    size={20}
                  />

                  <span className="text-muted">
                    Department
                  </span>

                </div>

                <div className="fw-semibold ms-4 ps-2">
                  {data?.department_name ||
                    data?.department?.name ||
                    "-"}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =========================
          SECURITY CARD
      ========================== */}

      <div className="card border-0 shadow-sm mt-4">

        <div className="card-body p-4">

          <div className="d-flex align-items-center">

            <div className="bg-light rounded p-2 me-3">
              <FaShieldAlt
                className="text-primary"
                size={22}
              />
            </div>

            <div className="flex-grow-1">

              <h5 className="fw-bold mb-1">
                Account Security
              </h5>

              <p className="text-muted mb-0">
                Your account is protected by authenticated
                access to the PulsePath system.
              </p>

            </div>

            <span className="badge bg-success px-3 py-2">
              Secure
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;