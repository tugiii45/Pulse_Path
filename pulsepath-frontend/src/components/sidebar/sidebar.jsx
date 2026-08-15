import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaUserMd,
  FaHospital,
  FaBuilding,
  FaFileMedical,
  FaPills,
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

  if (loading) {
    return (
      <div
        className="bg-white border-end shadow-sm p-3"
        style={{ width: "260px", minHeight: "calc(100vh - 70px)" }}
      >
        <div className="text-center py-4 text-muted">Loading menu...</div>
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

  if (role === "ADMIN" || role === "DOCTOR") {
    menuItems.push({
      to: "/dashboard/patients",
      label: "Patients",
      icon: <FaUserInjured className="me-3" />,
    });
  }

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

  if (role !== "PATIENT") {
    menuItems.push({
      to: "/dashboard/clinical",
      label: "Clinical",
      icon: <FaFileMedical className="me-3" />,
    });

    menuItems.push({
      to: "/dashboard/treatment",
      label: "Treatment",
      icon: <FaPills className="me-3" />,
    });

    menuItems.push({
      to: "/dashboard/treatment/medication",
      label: "Medications",
      icon: <FaPills className="me-3" />,
    });
    menuItems.push({
      to: "/dashboard/treatment/recovery-progress",
      label: "Recovery Progress",
      icon: <FaHeartbeat className="me-3" />,
    });

    menuItems.push({
      to: "/dashboard/treatment/medication-schedule",
      label: "Medication Schedule",
      icon: <FaClock className="me-3" />,
    });

    menuItems.push({
      to: "/dashboard/treatment/medication-log",
      label: "Medication Log",
      icon: <FaClipboardCheck className="me-3" />,
    });

    menuItems.push({
      to: "/dashboard/treatment/side-effects",
      label: "Side Effects",
      icon: <FaExclamationTriangle className="me-3" />,
    });

    menuItems.push({
      to: "/dashboard/treatment/prescriptions",
      label: "Prescriptions",
      icon: <FaFileMedical className="me-3" />,
    });
  }

  menuItems.push({
    to: "/dashboard/notifications",
    label: "Notifications",
    icon: <FaBell className="me-3" />,
  });

  menuItems.push({
    to: "/dashboard/profile",
    label: "Profile",
    icon: <FaUser className="me-3" />,
  });

  return (
    <div
      className="bg-white border-end shadow-sm p-3"
      style={{ width: "260px", minHeight: "calc(100vh - 70px)" }}
    >
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
    </div>
  );
}

export default Sidebar;
