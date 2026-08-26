import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const REGISTER_HOSPITAL_PATH = "/dashboard/register-hospital";

function ProtectedRoute({ allowedRoles = [], requireSuperuser = false }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // An ADMIN with no hospital yet has nothing to manage: send them to
  // self-service registration instead of whatever they were headed
  // to. Superadmins are exempt -- they manage all hospitals platform-
  // wide and are never expected to own one themselves. Skip this when
  // already on that page, or every render would redirect right back
  // to itself.
  const needsHospital =
    profile.role === "ADMIN" &&
    !profile.is_superuser &&
    !profile.hospital &&
    location.pathname !== REGISTER_HOSPITAL_PATH;

  if (needsHospital) {
    return <Navigate to={REGISTER_HOSPITAL_PATH} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Some pages (e.g. the platform-wide hospital management panel) are
  // for the superadmin only, not just anyone with role=ADMIN. A
  // regular admin who has role=ADMIN but is_superuser=false gets sent
  // back to the dashboard, same as a role mismatch.
  if (requireSuperuser && !profile.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;