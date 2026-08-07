import { useEffect, useState } from "react";
import { getDoctors } from "../../services/doctorService";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const loadDoctors = async (url = "doctors/", page = 1) => {
    try {
      const response = await getDoctors(url);

      setDoctors(response.data.results);
      setNextPage(response.data.next);
      setPreviousPage(response.data.previous);
      setCurrentPage(page);
      setTotalDoctors(response.data.count);
      setTotalPages(Math.ceil(response.data.count / 10));
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  return (
    <div className="container-fluid py-4">

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Doctors</h2>
          <p className="text-muted mb-0">
            Manage and view registered doctors.
          </p>
        </div>

        <div className="badge bg-primary fs-6 px-3 py-2">
          {totalDoctors} Doctors
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th className="px-4">Doctor</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>License</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <tr key={doctor.id}>

                      {/* Doctor */}
                      <td className="px-4">
                        <div className="d-flex align-items-center">

                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "42px",
                              height: "42px",
                              fontWeight: "600",
                            }}
                          >
                            {doctor.full_name?.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {doctor.full_name}
                            </div>

                            <small className="text-muted">
                              Doctor ID: {doctor.id}
                            </small>
                          </div>

                        </div>
                      </td>

                      {/* Email */}
                      <td>{doctor.email}</td>

                      {/* Department */}
                      <td>
                        <span className="badge bg-light text-dark">
                          {doctor.department_name}
                        </span>
                      </td>

                      {/* Specialization */}
                      <td>
                        <span className="badge bg-info-subtle text-info-emphasis">
                          {doctor.specialization}
                        </span>
                      </td>

                      {/* Experience */}
                      <td>
                        <span className="fw-semibold">
                          {doctor.years_of_experience}
                        </span>{" "}
                        years
                      </td>

                      {/* License */}
                      <td>
                        <code>{doctor.license_number}</code>
                      </td>

                      {/* Action */}
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary">
                          View
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        No doctors found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center align-items-center mt-4">
        <nav>
          <ul className="pagination mb-0">

            {/* Previous */}
            <li
              className={`page-item ${
                !previousPage ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                disabled={!previousPage}
                onClick={() =>
                  loadDoctors(previousPage, currentPage - 1)
                }
              >
                Previous
              </button>
            </li>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;

              return (
                <li
                  key={pageNumber}
                  className={`page-item ${
                    currentPage === pageNumber ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => {
                      if (pageNumber === currentPage) return;

                      loadDoctors(
                        `doctors/?page=${pageNumber}`,
                        pageNumber
                      );
                    }}
                  >
                    {pageNumber}
                  </button>
                </li>
              );
            })}

            {/* Next */}
            <li
              className={`page-item ${
                !nextPage ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                disabled={!nextPage}
                onClick={() =>
                  loadDoctors(nextPage, currentPage + 1)
                }
              >
                Next
              </button>
            </li>

          </ul>
        </nav>
      </div>

    </div>
  );
}

export default Doctors;