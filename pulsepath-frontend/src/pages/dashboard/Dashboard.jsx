import {
  FaUserInjured,
  FaUserMd,
  FaCalendarCheck,
  FaBell,
} from "react-icons/fa";

function Dashboard() {
  return (
    <div className="container-fluid">

      {/* Welcome Section */}
      <div className="mb-4">
        <h2 className="fw-bold">Welcome Back 👋</h2>
        <p className="text-muted">
          Here's an overview of your PulsePath healthcare system.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="row g-4">

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <FaUserInjured size={35} className="text-primary mb-3" />
              <h5>Total Patients</h5>
              <h2 className="fw-bold">245</h2>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <FaUserMd size={35} className="text-success mb-3" />
              <h5>Doctors</h5>
              <h2 className="fw-bold">34</h2>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <FaCalendarCheck size={35} className="text-warning mb-3" />
              <h5>Appointments</h5>
              <h2 className="fw-bold">18</h2>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <FaBell size={35} className="text-danger mb-3" />
              <h5>Notifications</h5>
              <h2 className="fw-bold">6</h2>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="card shadow-sm border-0 mt-5">
        <div className="card-body">
          <h4 className="mb-3">Recent Activity</h4>

          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              ✔ New patient registered.
            </li>

            <li className="list-group-item">
              ✔ Appointment scheduled for today.
            </li>

            <li className="list-group-item">
              ✔ Medication reminder sent.
            </li>

            <li className="list-group-item">
              ✔ Recovery progress updated.
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;