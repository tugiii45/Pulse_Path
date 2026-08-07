import { useEffect, useState } from "react";
import { getPatients } from "../../services/patientService";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPatients = async (url = "patients/", page = 1) => {
    try {
      const response = await getPatients(url);

      setPatients(response.data.results);
      setNextPage(response.data.next);
      setPreviousPage(response.data.previous);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.data.count / 10));
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Patients</h2>
          <p className="text-muted mb-0">
            Manage and view registered patients.
          </p>
        </div>

        <div className="badge bg-primary fs-6 px-3 py-2">
          {patients.length} Patients
        </div>
      </div>

      {/* Patients Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Patient</th>
                  <th>Email</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>Emergency Contact</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-4">
                      <div className="fw-semibold">{patient.full_name}</div>
                    </td>

                    <td>{patient.email}</td>

                    <td>{patient.date_of_birth}</td>

                    <td>
                      <span className="badge bg-light text-dark">
                        {patient.gender}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-danger">
                        {patient.blood_group}
                      </span>
                    </td>

                    <td>{patient.emergency_contact}</td>

                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-center mt-4">
        <nav>
          <ul className="pagination mb-0">
            {/* Previous */}
            <li className={`page-item ${!previousPage ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => loadPatients(previousPage, currentPage - 1)}
                disabled={!previousPage}
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

                      loadPatients(`patients/?page=${pageNumber}`, pageNumber);
                    }}
                  >
                    {pageNumber}
                  </button>
                </li>
              );
            })}

            {/* Next */}
            <li className={`page-item ${!nextPage ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => loadPatients(nextPage, currentPage + 1)}
                disabled={!nextPage}
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

export default Patients;
