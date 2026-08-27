import { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaSignOutAlt,
  FaHeartbeat,
  FaChevronDown,
  FaUser,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : profile?.email || "User";

  const userRole = profile?.role?.toLowerCase() || "user";

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ""}`.toUpperCase()
    : userName[0]?.toUpperCase();

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow-sm"
      style={{ height: "70px" }}
    >
      {/* Brand */}
      <Link
        to="/dashboard"
        className="d-flex align-items-center gap-2 text-white text-decoration-none"
      >
        <FaHeartbeat size={22} />
        <span className="fw-semibold fs-5" style={{ letterSpacing: "0.02em" }}>
          PulsePath
        </span>
      </Link>

      {/* Right side */}
      <div className="d-flex align-items-center ms-auto">
        {/* Notifications */}
        <Link
          to="/dashboard/notifications"
          aria-label="Notifications"
          className="d-flex align-items-center justify-content-center text-white rounded-circle"
          style={{
            width: "40px",
            height: "40px",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <FaBell size={18} />
        </Link>

        {/* Divider */}
        <div
          className="mx-3 d-none d-sm-block"
          style={{
            width: "1px",
            height: "28px",
            backgroundColor: "rgba(255,255,255,0.25)",
          }}
        />

        {/* User menu */}
        <div className="position-relative" ref={menuRef}>
          <button
            className="btn d-flex align-items-center gap-2 text-white p-1 border-0 bg-transparent rounded-pill"
            style={{ transition: "background-color 0.15s ease" }}
            onClick={() => setMenuOpen((open) => !open)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div
              className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold"
              style={{ width: "36px", height: "36px", fontSize: "0.85rem" }}
            >
              {initials}
            </div>

            <div className="d-none d-lg-block text-start">
              <div className="fw-semibold small lh-sm">{userName}</div>
              <span
                className="badge rounded-pill bg-white bg-opacity-25 text-white text-capitalize fw-normal"
                style={{ fontSize: "0.65rem" }}
              >
                {userRole}
              </span>
            </div>

            <FaChevronDown
              size={11}
              className="d-none d-lg-block me-1"
              style={{
                transition: "transform 0.15s ease",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {menuOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg py-2 border"
              style={{
                width: "210px",
                zIndex: 1050,
                animation: "navbarDropdownFade 0.12s ease-out",
              }}
            >
              <div className="px-3 py-2 d-lg-none border-bottom mb-1">
                <div className="fw-semibold small text-dark">{userName}</div>
                <small className="text-muted text-capitalize">
                  {userRole}
                </small>
              </div>

              <Link
                to="/dashboard/profile"
                className="d-flex align-items-center gap-2 px-3 py-2 text-dark text-decoration-none small"
                onClick={() => setMenuOpen(false)}
              >
                <FaUser size={13} className="text-muted" />
                My Profile
              </Link>

              <hr className="my-1 text-muted opacity-25" />

              <button
                className="d-flex align-items-center gap-2 px-3 py-2 text-danger small w-100 border-0 bg-transparent text-start"
                onClick={handleLogout}
              >
                <FaSignOutAlt size={13} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes navbarDropdownFade {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;