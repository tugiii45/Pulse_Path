import {
  FaCalendarCheck,
  FaClipboardCheck,
  FaPills,
  FaChartLine,
  FaBell,
  FaUserMd,
} from "react-icons/fa";

function Features() {
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

  return (
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
  );
}

export default Features;