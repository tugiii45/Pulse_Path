import { FaBell, FaSearch, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/AuthService";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary px-4"
      style={{ height: "70px" }}
    >
      {/* Logo */}
      <div className="fw-bold fs-4">PulsePath</div>

      {/* Right Side */}
      <div className="d-flex align-items-center ms-auto">
        {/* Search */}
        <div className="input-group me-4" style={{ width: "300px" }}>
          <span className="input-group-text">
            <FaSearch />
          </span>

          <input type="text" className="form-control" placeholder="Search..." />
        </div>

        {/* Notifications */}
        <FaBell
          size={20}
          className="text-white me-4"
          style={{ cursor: "pointer" }}
        />

        {/* User */}
        <div className="d-flex align-items-center text-white me-4">
          <FaUserCircle size={35} className="me-2" />

          <div>
            <div className="fw-bold">Conrad</div>

            <small>Administrator</small>
          </div>
        </div>

        {/* Logout */}
        <div className="border-start border-light border-opacity-25 ps-3 ms-1">
          <button
            onClick={handleLogout}
            className="btn d-flex align-items-center gap-2 px-3 py-2"
            style={{
              color: "#ffb3b3",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#dc3545";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "#dc3545";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#ffb3b3";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }}
          >
            <FaSignOutAlt size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
