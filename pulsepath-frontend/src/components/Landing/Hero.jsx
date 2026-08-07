import { Link } from "react-router-dom";
import {
  FaHeartbeat,
  FaPills,
  FaBell,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

function Hero() {
  return (
    <section
      id="home"
      className="py-5"
      style={{
        background:
          "linear-gradient(135deg, #f3f8ff 0%, #ffffff 55%, #eefaf6 100%)",
      }}
    >
      <div className="container py-lg-5">

        <div className="row align-items-center g-5">

          {/* Left side */}
          <div className="col-lg-6">

            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mb-3">
              Connected healthcare, made simpler
            </span>

            <h1 className="display-3 fw-bold lh-sm mb-4">
              Your health journey,
              <span className="text-primary"> connected.</span>
            </h1>

            <p className="lead text-secondary mb-4">
              PulsePath helps patients stay on track with their treatment,
              medication, appointments, and recovery while keeping
              healthcare teams connected every step of the way.
            </p>

            <div className="d-flex flex-wrap gap-3">

              <Link
                to="/register"
                className="btn btn-primary btn-lg px-4 py-3 d-flex align-items-center"
              >
                Start Your Journey
                <FaArrowRight className="ms-2" />
              </Link>

              <a
                href="#how-it-works"
                className="btn btn-outline-secondary btn-lg px-4 py-3"
              >
                See How It Works
              </a>

            </div>

            <div className="d-flex flex-wrap gap-4 mt-5">

              <div>
                <div className="fw-bold text-dark fs-5">
                  Medication
                </div>
                <small className="text-muted">
                  Stay on schedule
                </small>
              </div>

              <div>
                <div className="fw-bold text-dark fs-5">
                  Recovery
                </div>
                <small className="text-muted">
                  Track your progress
                </small>
              </div>

              <div>
                <div className="fw-bold text-dark fs-5">
                  Connected Care
                </div>
                <small className="text-muted">
                  Stay informed
                </small>
              </div>

            </div>

          </div>

          {/* Right side */}
          <div className="col-lg-6">

            <div className="position-relative">

              <div
                className="card border-0 shadow-lg rounded-4 p-4"
                style={{
                  maxWidth: "480px",
                  margin: "auto",
                }}
              >

                <div className="d-flex justify-content-between align-items-center mb-4">

                  <div>
                    <small className="text-muted">
                      Recovery Progress
                    </small>

                    <h4 className="fw-bold mb-0">
                      You're making progress
                    </h4>
                  </div>

                  <div
                    className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center"
                    style={{
                      width: "52px",
                      height: "52px",
                    }}
                  >
                    <FaCheckCircle className="fs-4" />
                  </div>

                </div>

                {/* Progress */}
                <div className="mb-4">

                  <div className="d-flex justify-content-between mb-2">

                    <span className="text-muted">
                      Recovery progress
                    </span>

                    <span className="fw-bold text-primary">
                      72%
                    </span>

                  </div>

                  <div
                    className="progress"
                    style={{ height: "10px" }}
                  >
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: "72%" }}
                    ></div>
                  </div>

                </div>

                {/* Medication */}
                <div className="bg-light rounded-4 p-3 mb-3">

                  <div className="d-flex align-items-center">

                    <div
                      className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "48px",
                        height: "48px",
                      }}
                    >
                      <FaPills className="fs-4" />
                    </div>

                    <div className="flex-grow-1">

                      <div className="fw-semibold">
                        Morning Medication
                      </div>

                      <small className="text-muted">
                        Scheduled for 8:00 AM
                      </small>

                    </div>

                    <span className="badge bg-success">
                      Taken
                    </span>

                  </div>

                </div>

                {/* Recovery */}
                <div className="bg-light rounded-4 p-3">

                  <div className="d-flex align-items-center">

                    <div
                      className="rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "48px",
                        height: "48px",
                      }}
                    >
                      <FaHeartbeat className="fs-4" />
                    </div>

                    <div className="flex-grow-1">

                      <div className="fw-semibold">
                        Today's Recovery Check
                      </div>

                      <small className="text-muted">
                        Feeling better today
                      </small>

                    </div>

                    <FaCheckCircle className="text-success fs-5" />

                  </div>

                </div>

              </div>

              {/* Floating reminder */}
              <div
                className="card border-0 shadow rounded-4 position-absolute d-none d-md-block"
                style={{
                  right: "-10px",
                  bottom: "35px",
                  width: "200px",
                }}
              >

                <div className="card-body p-3">

                  <div className="d-flex align-items-center mb-2">

                    <FaBell className="text-warning me-2" />

                    <small className="text-muted">
                      PulsePath Reminder
                    </small>

                  </div>

                  <div className="fw-semibold">
                    Evening medication is due
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;