import { Link } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 border-bottom sticky-top">
      <div className="container">

        {/* Logo */}
        <Link
          to="/"
          className="navbar-brand fw-bold fs-3 text-primary d-flex align-items-center"
        >
          <FaHeartbeat className="me-2" />
          PulsePath
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#landingNavbar"
          aria-controls="landingNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation */}
        <div className="collapse navbar-collapse" id="landingNavbar">

          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">

            <li className="nav-item">
              <a className="nav-link fw-medium" href="#home">
                Home
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link fw-medium" href="#features">
                Features
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link fw-medium" href="#how-it-works">
                How It Works
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link fw-medium" href="#about">
                About
              </a>
            </li>

          </ul>

          {/* Authentication Buttons */}
          <div className="d-flex gap-2">

            <Link
              to="/login"
              className="btn btn-outline-primary px-4"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="btn btn-primary px-4"
            >
              Get Started
            </Link>

          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;