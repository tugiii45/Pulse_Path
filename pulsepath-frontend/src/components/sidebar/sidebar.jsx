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
  return (
    <div
      className="bg-light border-end p-3"
      style={{ width: "260px", minHeight: "100vh" }}
    >
      <h4 className="fw-bold text-primary mb-4">PulsePath</h4>

      <div className="nav flex-column">

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaHome className="me-2" />
          Dashboard
        </NavLink>

        <NavLink
          to="/appointments"
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaCalendarAlt className="me-2" />
          Appointments
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaUserInjured className="me-2" />
          Patients
        </NavLink>

        <NavLink
          to="/doctors"
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaUserMd className="me-2" />
          Doctors
        </NavLink>

        <NavLink
          to="/clinical"
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaFileMedical className="me-2" />
          Clinical
        </NavLink>

        <NavLink
          to="/treatment"
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaPills className="me-2" />
          Treatment
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaBell className="me-2" />
          Notifications
        </NavLink>

        <NavLink
          to="/hospitals"
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaHospital className="me-2" />
          Hospitals
        </NavLink>

        <NavLink
          to="/departments"
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaBuilding className="me-2" />
          Departments
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `nav-link mb-2 ${isActive ? "active fw-bold text-primary" : "text-dark"}`
          }
        >
          <FaUser className="me-2" />
          Profile
        </NavLink>

      </div>
    </div>
  );
}

export default Sidebar;