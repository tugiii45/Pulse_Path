import { useEffect, useState } from "react";
import { getProfile } from "../../services/profileService";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();

      console.log("PROFILE API RESPONSE:", response);

      setProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>Profile not found.</p>;
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2>My Profile</h2>
        <p className="text-muted">
          View your account information.
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-4">
            Account Information
          </h5>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="text-muted">First Name</label>
              <p className="fw-semibold">
                {profile.first_name || "Not provided"}
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="text-muted">Last Name</label>
              <p className="fw-semibold">
                {profile.last_name || "Not provided"}
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="text-muted">Email</label>
              <p className="fw-semibold">
                {profile.email}
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="text-muted">Phone Number</label>
              <p className="fw-semibold">
                {profile.phone_number || "Not provided"}
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="text-muted">Role</label>
              <p>
                <span className="badge bg-primary">
                  {profile.role}
                </span>
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="text-muted">Hospital</label>
              <p className="fw-semibold">
                {profile.hospital || "Not assigned"}
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="text-muted">Account Status</label>
              <p>
                <span
                  className={`badge ${
                    profile.is_active
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                >
                  {profile.is_active ? "Active" : "Inactive"}
                </span>
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="text-muted">Date Joined</label>
              <p className="fw-semibold">
                {new Date(
                  profile.date_joined
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;