import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaPills,
  FaBell,
  FaChartLine,
  FaComments,
  FaUserMd,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

function PatientDashboard() {
  // Temporary data.
  // We will replace this with backend API data later.
  const patient = {
    name: "Conrad",
  };

  const nextAppointment = {
    doctor: "Dr. John Kamau",
    department: "General Medicine",
    date: "20 August 2026",
    time: "10:30 AM",
    hospital: "PulsePath Hospital",
  };

  const medications = [
    {
      name: "Amoxicillin",
      time: "8:00 AM",
      status: "Taken",
    },
    {
      name: "Paracetamol",
      time: "2:00 PM",
      status: "Upcoming",
    },
    {
      name: "Amoxicillin",
      time: "8:00 PM",
      status: "Upcoming",
    },
  ];

  const reminders = [
    "Take your medicine at 2:00 PM",
    "You have an appointment tomorrow",
  ];

  const recovery = {
    progress: 70,
    feelingBetter: true,
    lastUpdated: "15 August 2026",
  };

  const recentResults = [
    {
      name: "Blood Test",
      date: "14 August 2026",
    },
    {
      name: "Blood Pressure Check",
      date: "12 August 2026",
    },
  ];

  const latestMessage = {
    sender: "Dr. John Kamau",
    message: "You have a new message from your doctor.",
  };

  return (
    <div className="container-fluid py-4">

      {/* =========================
          WELCOME SECTION
      ========================== */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Good morning, {patient.name} 👋
        </h2>

        <p className="text-muted mb-0">
          Here's your health summary for today.
        </p>
      </div>


      {/* =========================
          MAIN DASHBOARD CARDS
      ========================== */}
      <div className="row g-4">


        {/* =========================
            NEXT APPOINTMENT
        ========================== */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaCalendarAlt className="text-primary" />
                    <h5 className="fw-bold mb-0">
                      Next Appointment
                    </h5>
                  </div>

                  <p className="text-muted mb-0">
                    Your upcoming appointment
                  </p>
                </div>

                <span className="badge bg-primary-subtle text-primary">
                  Upcoming
                </span>
              </div>


              <div className="mt-4">

                <div className="d-flex align-items-center mb-3">
                  <FaUserMd className="text-muted me-3" />

                  <div>
                    <small className="text-muted">
                      Doctor
                    </small>

                    <div className="fw-semibold">
                      {nextAppointment.doctor}
                    </div>
                  </div>
                </div>


                <div className="d-flex align-items-center mb-3">
                  <FaCalendarAlt className="text-muted me-3" />

                  <div>
                    <small className="text-muted">
                      Date
                    </small>

                    <div className="fw-semibold">
                      {nextAppointment.date}
                    </div>
                  </div>
                </div>


                <div className="d-flex align-items-center mb-3">
                  <FaClock className="text-muted me-3" />

                  <div>
                    <small className="text-muted">
                      Time
                    </small>

                    <div className="fw-semibold">
                      {nextAppointment.time}
                    </div>
                  </div>
                </div>


                <div className="text-muted small mb-3">
                  🏥 {nextAppointment.hospital}
                </div>

              </div>


              <button className="btn btn-outline-primary w-100">
                View Appointment
                <FaArrowRight className="ms-2" size={12} />
              </button>

            </div>
          </div>
        </div>



        {/* =========================
            TODAY'S MEDICATIONS
        ========================== */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-2 mb-2">
                <FaPills className="text-success" />

                <h5 className="fw-bold mb-0">
                  Today's Medications
                </h5>
              </div>

              <p className="text-muted mb-3">
                Your medication schedule for today
              </p>


              {medications.map((medication, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center border-bottom py-3"
                >

                  <div>
                    <div className="fw-semibold">
                      {medication.name}
                    </div>

                    <small className="text-muted">
                      {medication.time}
                    </small>
                  </div>


                  {medication.status === "Taken" ? (
                    <span className="badge bg-success-subtle text-success">
                      <FaCheckCircle className="me-1" />
                      Taken
                    </span>
                  ) : (
                    <span className="badge bg-warning-subtle text-warning">
                      <FaClock className="me-1" />
                      Upcoming
                    </span>
                  )}

                </div>
              ))}


              <button className="btn btn-outline-success w-100 mt-3">
                View Medications
                <FaArrowRight className="ms-2" size={12} />
              </button>

            </div>
          </div>
        </div>



        {/* =========================
            REMINDERS
        ========================== */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-2 mb-2">
                <FaBell className="text-warning" />

                <h5 className="fw-bold mb-0">
                  Reminders
                </h5>
              </div>

              <p className="text-muted mb-3">
                Things you may need to take care of
              </p>


              {reminders.length > 0 ? (
                reminders.map((reminder, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-start gap-3 p-3 bg-light rounded mb-2"
                  >
                    <FaBell
                      className="text-warning mt-1"
                      size={14}
                    />

                    <span>
                      {reminder}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  <FaCheckCircle className="text-success mb-2" size={25} />

                  <p className="mb-0">
                    You have no reminders.
                  </p>
                </div>
              )}


              <button className="btn btn-outline-warning w-100 mt-2">
                View Notifications
                <FaArrowRight className="ms-2" size={12} />
              </button>

            </div>
          </div>
        </div>



        {/* =========================
            RECOVERY PROGRESS
        ========================== */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-2 mb-2">
                <FaChartLine className="text-info" />

                <h5 className="fw-bold mb-0">
                  Your Recovery
                </h5>
              </div>

              <p className="text-muted mb-4">
                A simple view of your treatment progress
              </p>


              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">

                  <span className="fw-semibold">
                    Treatment Progress
                  </span>

                  <span className="fw-bold">
                    {recovery.progress}%
                  </span>

                </div>


                <div
                  className="progress"
                  style={{ height: "10px" }}
                >
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${recovery.progress}%`,
                    }}
                    aria-valuenow={recovery.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>


              <div className="d-flex justify-content-between align-items-center mt-4">

                <div>
                  <small className="text-muted">
                    Feeling better
                  </small>

                  <div className="fw-semibold">
                    {recovery.feelingBetter ? "Yes" : "Not yet"}
                  </div>
                </div>


                <div>
                  <small className="text-muted">
                    Last updated
                  </small>

                  <div className="fw-semibold">
                    {recovery.lastUpdated}
                  </div>
                </div>

              </div>


              <button className="btn btn-outline-info w-100 mt-4">
                View Recovery
                <FaArrowRight className="ms-2" size={12} />
              </button>

            </div>
          </div>
        </div>



        

        {/* =========================
            MESSAGES
        ========================== */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <div className="d-flex align-items-center gap-2 mb-2">
                <FaComments className="text-secondary" />

                <h5 className="fw-bold mb-0">
                  Messages
                </h5>
              </div>

              <p className="text-muted mb-4">
                Messages from your healthcare team
              </p>


              <div className="d-flex align-items-start gap-3 p-3 bg-light rounded">

                <div className="rounded-circle bg-secondary-subtle p-3">
                  <FaUserMd className="text-secondary" />
                </div>


                <div>
                  <div className="fw-semibold">
                    {latestMessage.sender}
                  </div>

                  <p className="text-muted small mb-0 mt-1">
                    {latestMessage.message}
                  </p>
                </div>

              </div>


              <button className="btn btn-outline-secondary w-100 mt-3">
                View Messages
                <FaArrowRight className="ms-2" size={12} />
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PatientDashboard;