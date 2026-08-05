function AuthLayout({ children }) {
  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">

        {/* Left Branding Panel */}
        <div className="col-lg-6 d-none d-lg-flex bg-primary text-white justify-content-center align-items-center">
          <div className="text-center px-5">

            <h1 className="fw-bold display-4">
              PulsePath
            </h1>

            <h5 className="mb-4">
              Healthcare Management System
            </h5>

            <p className="lead">
              Connecting patients, doctors and hospitals
              through one secure digital platform.
            </p>

            <hr className="my-4" />

            <div className="text-start d-inline-block">
              <p>✔ Secure Patient Records</p>
              <p>✔ Smart Appointment Scheduling</p>
              <p>✔ Medication Tracking</p>
              <p>✔ Recovery Monitoring</p>
            </div>

          </div>
        </div>

        {/* Right Form Panel */}
        <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center bg-light">

          <div
            className="card shadow border-0 p-5"
            style={{ width: "100%", maxWidth: "450px" }}
          >
            {children}
          </div>

        </div>

      </div>
    </div>
  );
}

export default AuthLayout;