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
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaPills,
  FaStethoscope,
  FaFileMedical,
} from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";

function Sidebar() {
  const { profile, loading } = useAuth();

  const linkClass = ({ isActive }) =>
    `sidebar-link d-flex align-items-center py-2 px-3 rounded-3 mb-1 ${
      isActive ? "bg-primary text-white fw-semibold shadow-sm" : "text-dark"
    }`;

  const subLinkClass = ({ isActive }) =>
    `sidebar-sublink d-flex align-items-center py-2 px-3 rounded-3 mb-1 ms-3 ${
      isActive ? "text-primary fw-semibold bg-primary bg-opacity-10" : "text-secondary"
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
        <div className="text-center py-4 text-muted small">
          Loading menu...
        </div>
      </div>
    );
  }

  const role = profile?.role || "";

  // =========================
  // MAIN NAVIGATION
  // =========================

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
      icon: <FaStethoscope className="me-3" />,
    },
  ];

  // =========================
  // ADMIN + DOCTOR
  // =========================

  if (role === "ADMIN" || role === "DOCTOR") {
    menuItems.push({
      to: "/dashboard/patients",
      label: "Patients",
      icon: <FaUserInjured className="me-3" />,
    });
  }

  // =========================
  // ADMIN ONLY
  // =========================

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
      className="d-flex flex-column bg-white border-end shadow-sm"
      style={{
        width: "260px",
        height: "calc(100vh - 70px)",
        position: "sticky",
        top: "70px",
      }}
    >
      {/* =========================
          SCROLLABLE NAVIGATION
      ========================== */}

      <div className="flex-grow-1 overflow-y-auto p-3">

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

        {/* =========================
            DOCTOR CLINICAL CARE
        ========================== */}

        {role === "DOCTOR" && (
          <div className="mt-4 mb-2">
            <div className="text-uppercase text-muted fw-bold px-3 mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>
              Clinical Care
            </div>

            <NavLink to="/dashboard/clinical" end className={subLinkClass}>
              <FaFileMedical className="me-3" size={14} />
              Clinical Records
            </NavLink>

            <NavLink to="/dashboard/clinical/medical-records" className={subLinkClass}>
              <FaNotesMedical className="me-3" size={14} />
              Medical Records
            </NavLink>

            <NavLink to="/dashboard/clinical/diagnosis" className={subLinkClass}>
              <FaNotesMedical className="me-3" size={14} />
              Diagnoses
            </NavLink>

            <NavLink to="/dashboard/treatment" end className={subLinkClass}>
              <FaStethoscope className="me-3" size={14} />
              Treatment
            </NavLink>

            <NavLink to="/dashboard/treatment/prescriptions" className={subLinkClass}>
              <FaPrescriptionBottleAlt className="me-3" size={14} />
              Prescriptions
            </NavLink>

            <NavLink to="/dashboard/treatment/medication" className={subLinkClass}>
              <FaPills className="me-3" size={14} />
              Medications
            </NavLink>

            <NavLink to="/dashboard/treatment/medication-schedule" className={subLinkClass}>
              <FaClock className="me-3" size={14} />
              Medication Schedules
            </NavLink>

            <NavLink to="/dashboard/treatment/recovery-progress" className={subLinkClass}>
              <FaHeartbeat className="me-3" size={14} />
              Recovery Progress
            </NavLink>

            <NavLink to="/dashboard/treatment/side-effects" className={subLinkClass}>
              <FaExclamationTriangle className="me-3" size={14} />
              Side Effects
            </NavLink>
          </div>
        )}

        {/* =========================
            PATIENT RECOVERY
        ========================== */}

        {role === "PATIENT" && (
          <div className="mt-4 mb-2">
            <div className="text-uppercase text-muted fw-bold px-3 mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>
              My Recovery
            </div>

            <NavLink to="/dashboard/treatment/medication-schedule" className={subLinkClass}>
              <FaClock className="me-3" size={14} />
              Medication Schedule
            </NavLink>

            <NavLink to="/dashboard/treatment/medication-log" className={subLinkClass}>
              <FaClipboardCheck className="me-3" size={14} />
              Medication Log
            </NavLink>

            <NavLink to="/dashboard/treatment/side-effects" className={subLinkClass}>
              <FaExclamationTriangle className="me-3" size={14} />
              Side Effect Reporting
            </NavLink>

            <NavLink to="/dashboard/treatment/recovery-progress" className={subLinkClass}>
              <FaHeartbeat className="me-3" size={14} />
              Recovery Progress
            </NavLink>
          </div>
        )}
      </div>

      {/* =========================
          PERSISTENT FOOTER LINKS
          Always visible regardless of scroll position in the
          nav list above.
      ========================== */}

      <div className="border-top p-3">
        <NavLink to="/dashboard/notifications" className={linkClass}>
          <FaBell className="me-3" />
          Notifications
        </NavLink>

        <NavLink to="/dashboard/profile" className={linkClass}>
          <FaUser className="me-3" />
          Profile
        </NavLink>
      </div>

      <style>{`
        .sidebar-link:hover,
        .sidebar-sublink:hover {
          background-color: rgba(13, 110, 253, 0.08);
          text-decoration: none;
        }

        .sidebar-link,
        .sidebar-sublink {
          transition: background-color 0.15s ease, color 0.15s ease;
        }
      `}</style>
    </div>
  );
}

export default Sidebar;