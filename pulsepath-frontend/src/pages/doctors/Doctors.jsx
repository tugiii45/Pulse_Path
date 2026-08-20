import { useEffect, useState } from "react";
import { createDoctorByAdmin, getDoctors } from "../../services/DoctorService";
import { getDepartments } from "../../services/DepartmentService";

const initialFormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  specialization: "",
  license_number: "",
  years_of_experience: "0",
  department: "",
};

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState(initialFormState);

  const loadDoctors = async (url = "doctors/", page = 1) => {
    try {
      const response = await getDoctors(url);

      const results = response?.results || [];
      const count = response?.count || 0;

      setDoctors(results);
      setNextPage(response?.next || null);
      setPreviousPage(response?.previous || null);
      setCurrentPage(page);
      setTotalDoctors(count);
      setTotalPages(Math.max(1, Math.ceil(count / 10)));
    } catch (error) {
      console.error("Error fetching doctors:", error);

      setDoctors([]);
      setNextPage(null);
      setPreviousPage(null);
      setTotalDoctors(0);
      setTotalPages(1);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await getDepartments();

      // Support either a bare array or a paginated { results } shape,
      // same defensive pattern used elsewhere in the app.
      const list = Array.isArray(response)
        ? response
        : response?.results || [];

      setDepartments(list);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.department ||
      !formData.specialization ||
      !formData.license_number
    ) {
      setError(
        "Please fill in name, email, department, specialization, and license number.",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        specialization: formData.specialization,
        license_number: formData.license_number,
        years_of_experience: Number(formData.years_of_experience || 0),
        department: Number(formData.department),
      };

      const result = await createDoctorByAdmin(payload);

      setSuccess(
        result?.warning ||
          "Doctor account created. An invite email has been sent so they can set their password.",
      );

      resetForm();

      await loadDoctors();
    } catch (err) {
      console.error("Create doctor error:", err);

      const backendMessage =
        err?.response?.data?.errors || err?.response?.data?.message;

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : "Failed to create doctor.",
      );
    } finally {
      setSaving(false);
    }
  };

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

        <div className="d-flex gap-2 align-items-center">
          <button
            className="btn btn-primary"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
                setError("");
                setSuccess("");
              }
            }}
          >
            {showForm ? "Close" : "+ Add Doctor"}
          </button>

          <div className="badge bg-primary fs-6 px-3 py-2">
            {totalDoctors} Doctors
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-warning">{error}</div>}

      {success && <div className="alert alert-success">{success}</div>}

      {/* Add Doctor Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-1">Add Doctor</h5>

            <p className="text-muted small mb-3">
              The doctor will receive an email with a link to set their
              password and activate their account.
            </p>

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">First Name</label>

                <input
                  className="form-control"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Last Name</label>

                <input
                  className="form-control"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Phone Number
                </label>

                <input
                  type="tel"
                  className="form-control"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Department</label>

                <select
                  className="form-select"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a department</option>

                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Specialization
                </label>

                <input
                  className="form-control"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  License Number
                </label>

                <input
                  className="form-control"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Years of Experience
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="col-12 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Creating..." : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <div className="text-muted">No doctors found.</div>
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
            <li className={`page-item ${!previousPage ? "disabled" : ""}`}>
              <button
                className="page-link"
                disabled={!previousPage}
                onClick={() => loadDoctors(previousPage, currentPage - 1)}
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
                      if (pageNumber === currentPage) {
                        return;
                      }

                      loadDoctors(`doctors/?page=${pageNumber}`, pageNumber);
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
                disabled={!nextPage}
                onClick={() => loadDoctors(nextPage, currentPage + 1)}
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