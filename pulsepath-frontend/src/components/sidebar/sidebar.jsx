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
} from "react-icons/fa";

function Sidebar() {
  const linkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center py-3 px-3 rounded mb-2 ${
      isActive
        ? "bg-primary text-white fw-semibold"
        : "text-dark"
    }`;

  return (
    <div
      className="bg-white border-end shadow-sm p-3"
      style={{ width: "260px", minHeight: "calc(100vh - 70px)" }}
    >
      <h5 className="fw-bold text-primary mb-4">
        Navigation
      </h5>

      <NavLink to="/dashboard" end className={linkClass}>
        <FaHome className="me-3" />
        Dashboard
      </NavLink>

      <NavLink to="appointments" className={linkClass}>
        <FaCalendarAlt className="me-3" />
        Appointments
      </NavLink>

      <NavLink to="patients" className={linkClass}>
        <FaUserInjured className="me-3" />
        Patients
      </NavLink>

      <NavLink to="doctors" className={linkClass}>
        <FaUserMd className="me-3" />
        Doctors
      </NavLink>

      <NavLink to="clinical" className={linkClass}>
        <FaFileMedical className="me-3" />
        Clinical
      </NavLink>

      <NavLink to="treatment" className={linkClass}>
        <FaPills className="me-3" />
        Treatment
      </NavLink>

      <NavLink to="notifications" className={linkClass}>
        <FaBell className="me-3" />
        Notifications
      </NavLink>

      <NavLink to="hospitals" className={linkClass}>
        <FaHospital className="me-3" />
        Hospitals
      </NavLink>

      <NavLink to="departments" className={linkClass}>
        <FaBuilding className="me-3" />
        Departments
      </NavLink>

      <NavLink to="profile" className={linkClass}>
        <FaUser className="me-3" />
        Profile
      </NavLink>
    </div>
  );
}

export default Sidebar;