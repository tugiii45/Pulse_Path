
import { Link } from "react-router-dom";
import {
  FaHeartbeat,
  FaCalendarCheck,
  FaUserMd,
  FaPills,
  FaChartLine,
  FaBell,
  FaCheckCircle,
  FaHospital,
  FaClipboardCheck,
  FaArrowRight,
} from "react-icons/fa";

function LandingPage() {
  const features = [
    {
      icon: <FaCalendarCheck />,
      title: "Appointments",
      text: "Book, manage, and keep track of healthcare appointments with ease.",
    },
    {
      icon: <FaClipboardCheck />,
      title: "Clinical Records",
      text: "Keep important clinical information organized and accessible.",
    },
    {
      icon: <FaPills />,
      title: "Medication Tracking",
      text: "Follow medication schedules and keep track of your treatment.",
    },
    {
      icon: <FaChartLine />,
      title: "Recovery Monitoring",
      text: "Track symptoms, progress, and recovery throughout your journey.",
    },
    {
      icon: <FaBell />,
      title: "Smart Notifications",
      text: "Receive timely reminders for medications, appointments, and follow-ups.",
    },
    {
      icon: <FaUserMd />,
      title: "Connected Care Teams",
      text: "Keep healthcare professionals informed about patient progress.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Book an Appointment",
      text: "Connect with a healthcare professional and schedule your consultation.",
    },
    {
      number: "02",
      title: "Receive Your Treatment",
      text: "Your clinical information and treatment plan stay organized in one place.",
    },
    {
      number: "03",
      title: "Track Your Medication",
      text: "Follow your medication schedule and record your doses.",
    },
    {
      number: "04",
      title: "Monitor Recovery",
      text: "Track symptoms and recovery progress throughout your healthcare journey.",
    },
  ];

  return (
    <div className="bg-white">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 border-bottom sticky-top">
        <div className="container">

          <Link
            to="/"
            className="navbar-brand fw-bold fs-3 text-primary d-flex align-items-center"
          >
            <FaHeartbeat className="me-2" />
            PulsePath
          </Link>

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


      {/* ================= HERO ================= */}
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

            {/* Hero Content */}
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

              {/* Hero highlights */}
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


            {/* Hero Dashboard Visual */}
            <div className="col-lg-6">

              <div className="position-relative">

                <div
                  className="card border-0 shadow-lg rounded-4 p-4"
                  style={{
                    maxWidth: "480px",
                    margin: "auto",
                  }}
                >

                  {/* Card Header */}
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


                  {/* Recovery Check */}
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


                {/* Floating Reminder */}
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

                      <div className="text-warning me-2">
                        <FaBell />
                      </div>

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


      {/* ================= TRUST STRIP ================= */}
      <section className="py-4 border-bottom">

        <div className="container">

          <div className="row text-center g-4">

            <div className="col-md-3">
              <FaHeartbeat className="text-primary fs-3 mb-2" />

              <div className="fw-bold fs-5">
                Patient-Centered
              </div>

              <small className="text-muted">
                Designed around the patient
              </small>
            </div>


            <div className="col-md-3">
              <FaUserMd className="text-primary fs-3 mb-2" />

              <div className="fw-bold fs-5">
                Connected Care
              </div>

              <small className="text-muted">
                Keep care teams informed
              </small>
            </div>


            <div className="col-md-3">
              <FaChartLine className="text-primary fs-3 mb-2" />

              <div className="fw-bold fs-5">
                Smart Tracking
              </div>

              <small className="text-muted">
                Monitor treatment progress
              </small>
            </div>


            <div className="col-md-3">
              <FaBell className="text-primary fs-3 mb-2" />

              <div className="fw-bold fs-5">
                Timely Reminders
              </div>

              <small className="text-muted">
                Never miss important updates
              </small>
            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section id="features" className="py-5">

        <div className="container py-lg-5">

          <div className="text-center mb-5">

            <span className="text-primary fw-semibold">
              EVERYTHING IN ONE PLACE
            </span>

            <h2 className="display-6 fw-bold mt-2">
              Care that follows your journey
            </h2>

            <p
              className="text-muted mx-auto"
              style={{ maxWidth: "650px" }}
            >
              PulsePath connects the important parts of healthcare,
              helping patients and healthcare professionals stay informed.
            </p>

          </div>


          <div className="row g-4">

            {features.map((feature, index) => (

              <div
                className="col-md-6 col-lg-4"
                key={index}
              >

                <div className="card h-100 border-0 shadow-sm rounded-4 p-3">

                  <div className="card-body">

                    <div
                      className="rounded-4 bg-primary-subtle text-primary d-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: "58px",
                        height: "58px",
                        fontSize: "24px",
                      }}
                    >
                      {feature.icon}
                    </div>

                    <h5 className="fw-bold">
                      {feature.title}
                    </h5>

                    <p className="text-muted mb-0">
                      {feature.text}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="py-5"
        style={{
          backgroundColor: "#f8fafc",
        }}
      >

        <div className="container py-lg-5">

          <div className="text-center mb-5">

            <span className="text-primary fw-semibold">
              HOW IT WORKS
            </span>

            <h2 className="display-6 fw-bold mt-2">
              From treatment to recovery
            </h2>

            <p className="text-muted">
              PulsePath keeps your healthcare journey connected.
            </p>

          </div>


          <div className="row g-4">

            {steps.map((step, index) => (

              <div
                className="col-md-6 col-lg-3"
                key={index}
              >

                <div className="text-center px-2">

                  <div
                    className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center mx-auto mb-4"
                    style={{
                      width: "65px",
                      height: "65px",
                    }}
                  >
                    {step.number}
                  </div>

                  <h5 className="fw-bold">
                    {step.title}
                  </h5>

                  <p className="text-muted small">
                    {step.text}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= RECOVERY SECTION ================= */}
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


            {/* Recovery Cards */}
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


      {/* ================= CTA ================= */}
      <section className="py-5">

        <div className="container">

          <div
            className="rounded-5 p-5 text-center text-white"
            style={{
              background:
                "linear-gradient(135deg, #0d6efd, #087f8c)",
            }}
          >

            <FaHeartbeat className="fs-1 mb-3" />

            <h2 className="display-6 fw-bold">
              Your health journey deserves continuity.
            </h2>

            <p
              className="lead mx-auto my-4"
              style={{
                maxWidth: "650px",
              }}
            >
              Take control of your healthcare journey with PulsePath
              and stay connected from treatment to recovery.
            </p>

            <Link
              to="/register"
              className="btn btn-light btn-lg px-5 d-inline-flex align-items-center"
            >
              Get Started
              <FaArrowRight className="ms-2" />
            </Link>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
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

    </div>
  );
}

export default LandingPage;

