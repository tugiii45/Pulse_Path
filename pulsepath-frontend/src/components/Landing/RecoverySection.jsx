import { Link } from "react-router-dom";
import {
  FaPills,
  FaChartLine,
  FaBell,
  FaHeartbeat,
  FaArrowRight,
} from "react-icons/fa";

function RecoverySection() {
  return (
    <section id="about" className="py-5">

      <div className="container py-lg-5">

        <div className="row align-items-center g-5">

          {/* Text */}
          <div className="col-lg-6">

            <span className="text-primary fw-semibold">
              BUILT FOR CONTINUOUS CARE
            </span>

            <h2 className="display-6 fw-bold mt-2 mb-4">
              Recovery doesn't stop when you leave the hospital.
            </h2>

            <p className="text-muted lead">
              PulsePath helps bridge the gap between clinical treatment
              and everyday recovery.
            </p>

            <p className="text-muted">
              From medication schedules to symptom tracking and recovery
              updates, patients can stay engaged with their care while
              healthcare professionals gain a clearer view of progress.
            </p>

            <Link
              to="/register"
              className="btn btn-primary px-4 py-3 mt-2 d-inline-flex align-items-center"
            >
              Get Started
              <FaArrowRight className="ms-2" />
            </Link>

          </div>

          {/* Cards */}
          <div className="col-lg-6">

            <div className="row g-3">

              <div className="col-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

                  <FaPills className="text-primary fs-1 mb-3" />

                  <h5 className="fw-bold">
                    Medication
                  </h5>

                  <p className="text-muted small mb-0">
                    Keep treatment schedules organized.
                  </p>

                </div>
              </div>

              <div className="col-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

                  <FaChartLine className="text-primary fs-1 mb-3" />

                  <h5 className="fw-bold">
                    Progress
                  </h5>

                  <p className="text-muted small mb-0">
                    Understand recovery over time.
                  </p>

                </div>
              </div>

              <div className="col-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

                  <FaBell className="text-primary fs-1 mb-3" />

                  <h5 className="fw-bold">
                    Reminders
                  </h5>

                  <p className="text-muted small mb-0">
                    Stay informed about important care tasks.
                  </p>

                </div>
              </div>

              <div className="col-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

                  <FaHeartbeat className="text-primary fs-1 mb-3" />

                  <h5 className="fw-bold">
                    Better Care
                  </h5>

                  <p className="text-muted small mb-0">
                    Keep patients and care teams connected.
                  </p>

                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default RecoverySection;