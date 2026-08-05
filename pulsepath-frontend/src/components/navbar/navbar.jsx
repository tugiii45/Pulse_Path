import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";

function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary px-4"
      style={{ height: "70px" }}
    >
      <div className="container-fluid">

        <span className="navbar-brand fw-bold fs-4">
          PulsePath
        </span>

        <div className="d-flex align-items-center ms-auto">

          <div className="input-group me-4" style={{ width: "300px" }}>
            <span className="input-group-text">
              <FaSearch />
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Search..."
            />
          </div>

          <FaBell
            size={20}
            className="text-white me-4"
            style={{ cursor: "pointer" }}
          />

          <div className="d-flex align-items-center text-white">
            <FaUserCircle size={35} className="me-2" />

            <div>
              <div className="fw-bold">Conrad</div>
              <small>Administrator</small>
            </div>
          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;