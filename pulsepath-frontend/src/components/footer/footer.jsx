import { FaHeartbeat, FaEnvelope, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-dark text-light mt-auto">
      <div className="container py-5">
        <div className="row gy-4">

          {/* Brand */}
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaHeartbeat className="text-primary" size={22} />
              <span className="fw-bold fs-5">PulsePath</span>
            </div>

            <p className="text-secondary small mb-0">
              A connected healthcare management platform for hospitals,
              doctors, and patients.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4">
            <h6 className="text-uppercase fw-bold small mb-3 text-white-50">
              Quick Links
            </h6>

            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link to="/" className="text-secondary text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-secondary text-decoration-none">
                  Login
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-secondary text-decoration-none">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-4">
            <h6 className="text-uppercase fw-bold small mb-3 text-white-50">
              Contact
            </h6>

            <ul className="list-unstyled small text-secondary">
              <li className="mb-2 d-flex align-items-center gap-2">
                <FaEnvelope size={14} />
                support@pulsepath.com
              </li>
              <li className="d-flex align-items-center gap-2">
                <FaPhone size={14} />
                +254 728 265 128
              </li>
            </ul>
          </div>

        </div>

        <hr className="border-secondary mt-4 mb-3" />

        <div className="text-center text-secondary small">
          &copy; {new Date().getFullYear()} PulsePath. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;