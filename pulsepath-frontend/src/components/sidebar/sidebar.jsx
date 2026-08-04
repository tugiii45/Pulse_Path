function Sidebar() {
  return (
    <div
      className="bg-light border-end p-3"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <h5 className="fw-bold mb-4">Menu</h5>

      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-dark">
            Dashboard
          </a>
        </li>

        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-dark">
            Appointments
          </a>
        </li>

        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-dark">
            Patients
          </a>
        </li>

        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-dark">
            Notifications
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;