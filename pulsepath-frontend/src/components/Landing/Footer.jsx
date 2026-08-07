import { Link } from "react-router-dom";
import {
  FaHeartbeat,
  FaHospital,
  FaUserMd,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4">

      <div className="container">

        <div className="row g-4">

          {/* Brand */}
          <div className="col-lg-5">

            <h4 className="fw-bold d-flex align-items-center">

              <FaHeartbeat className="me-2 text-primary" />

              PulsePath

            </h4>

            <p className="text-white-50 mt-3">
              Connecting patients, healthcare professionals, treatment,
              and recovery in one continuous healthcare journey.
            </p>

          </div>


          {/* Platform */}
          <div className="col-6 col-lg-2">

            <h6 className="fw-bold">
              Platform
            </h6>

            <ul className="list-unstyled mt-3">

              <li className="mb-2">
                <a
                  href="#features"
                  className="text-white-50 text-decoration-none"
                >
                  Features
                </a>
              </li>

              <li className="mb-2">
                <a
                  href="#how-it-works"
                  className="text-white-50 text-decoration-none"
                >
                  How It Works
                </a>
              </li>

              <li>
                <a
                  href="#about"
                  className="text-white-50 text-decoration-none"
                >
                  About
                </a>
              </li>

            </ul>

          </div>


          {/* Account */}
          <div className="col-6 col-lg-2">

            <h6 className="fw-bold">
              Account
            </h6>

            <ul className="list-unstyled mt-3">

              <li className="mb-2">
                <Link
                  to="/login"
                  className="text-white-50 text-decoration-none"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="text-white-50 text-decoration-none"
                >
                  Register
                </Link>
              </li>

            </ul>

          </div>


          {/* Healthcare */}
          <div className="col-lg-3">

            <h6 className="fw-bold">
              Healthcare
            </h6>

            <p className="text-white-50 mt-3 small">
              Better connected care.
              <br />
              Better supported recovery.
            </p>

            <div className="d-flex gap-3 text-white-50">

              <FaHospital />
              <FaUserMd />
              <FaHeartbeat />

            </div>

          </div>

        </div>


        <hr className="border-secondary my-4" />


        <div className="d-flex flex-column flex-md-row justify-content-between text-white-50 small">

          <span>
            © 2026 PulsePath. All rights reserved.
          </span>

          <span className="mt-2 mt-md-0">
            Healthcare • Connection • Recovery
          </span>

        </div>

      </div>

    </footer>
  );
}

export default Footer;