import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaUserMd,
  FaHospital,
  FaBuilding,
  FaBell,
  FaUser,
  FaClock,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaHeartbeat,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

function Sidebar() {
  const { profile, loading } = useAuth();

  const linkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center py-3 px-3 rounded mb-2 ${
      isActive ? "bg-primary text-white fw-semibold" : "text-dark"
    }`;

  const subLinkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center py-2 px-3 rounded mb-1 ms-3 ${
      isActive
        ? "text-primary fw-semibold bg-light"
        : "text-secondary"
    }`;

  if (loading) {
    return (
      <div
        className="bg-white border-end shadow-sm p-3"
        style={{
          width: "260px",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <div className="text-center py-4 text-muted">
          Loading menu...
        </div>
      </div>
    );
  }

  const role = profile?.role || "";

  const menuItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <FaHome className="me-3" />,
    },
    {
      to: "/dashboard/appointments",
      label: "Appointments",
      icon: <FaCalendarAlt className="me-3" />,
    },
    {
      to: "/dashboard/visits",
      label: "Visits",
      icon: <FaCalendarAlt className="me-3" />,
    },
  ];

  // Admin and Doctor navigation.
  if (role === "ADMIN" || role === "DOCTOR") {
    menuItems.push({
      to: "/dashboard/patients",
      label: "Patients",
      icon: <FaUserInjured className="me-3" />,
    });
  }

  // Admin-only navigation.
  if (role === "ADMIN") {
    menuItems.push({
      to: "/dashboard/doctors",
      label: "Doctors",
      icon: <FaUserMd className="me-3" />,
    });

    menuItems.push({
      to: "/dashboard/hospitals",
      label: "Hospitals",
      icon: <FaHospital className="me-3" />,
    });

    menuItems.push({
      to: "/dashboard/departments",
      label: "Departments",
      icon: <FaBuilding className="me-3" />,
    });
  }

  return (
    <div
      className="bg-white border-end shadow-sm p-3"
      style={{
        width: "260px",
        minHeight: "calc(100vh - 70px)",
      }}
    >
      {/* Main navigation */}
      {menuItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/dashboard"}
          className={linkClass}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}

      {/* Patient recovery navigation */}
      {role === "PATIENT" && (
        <div className="mb-2">
          <div className="nav-link d-flex align-items-center py-3 px-3 rounded mb-2 text-dark fw-semibold">
            <FaHeartbeat className="me-3" />
            My Recovery
          </div>

          <NavLink
            to="/dashboard/treatment/medication-schedule"
            className={subLinkClass}
          >
            <FaClock className="me-3" />
            Medication Schedule
          </NavLink>

          <NavLink
            to="/dashboard/treatment/medication-log"
            className={subLinkClass}
          >
            <FaClipboardCheck className="me-3" />
            Medication Log
          </NavLink>

          <NavLink
            to="/dashboard/treatment/side-effects"
            className={subLinkClass}
          >
            <FaExclamationTriangle className="me-3" />
            Side Effect Reporting
          </NavLink>

          <NavLink
            to="/dashboard/treatment/recovery-progress"
            className={subLinkClass}
          >
            <FaHeartbeat className="me-3" />
            Recovery Progress
          </NavLink>
        </div>
      )}

      {/* Notifications */}
      <NavLink
        to="/dashboard/notifications"
        className={linkClass}
      >
        <FaBell className="me-3" />
        Notifications
      </NavLink>

      {/* Profile */}
      <NavLink
        to="/dashboard/profile"
        className={linkClass}
      >
        <FaUser className="me-3" />
        Profile
      </NavLink>
    </div>
  );
}

export default Sidebar;