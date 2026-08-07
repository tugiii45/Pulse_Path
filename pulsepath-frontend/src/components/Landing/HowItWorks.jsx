function HowItWorks() {
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
  );
}

export default HowItWorks;