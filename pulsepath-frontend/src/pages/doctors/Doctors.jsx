import { useEffect, useState } from "react";
import { createDoctorByAdmin, getDoctors } from "../../services/DoctorService";
import { getDepartments } from "../../services/departmentService";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

// ============================================================
// INITIAL FORM STATE
// Default values used when creating a new doctor.
// ============================================================
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
  // ============================================================
  // DOCTORS & DEPARTMENTS STATE
  // Stores the doctors displayed in the table and the departments
  // available when creating a new doctor.
  // ============================================================
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // ============================================================
  // PAGINATION STATE
  // Keeps track of pagination links, current page, total pages,
  // and the total number of doctors.
  // ============================================================
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);

  // ============================================================
  // FORM & UI STATE
  // Controls whether the form is visible, whether a request is
  // being submitted, and any success/error messages.
  // ============================================================
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // DOCTOR FORM DATA
  // Stores the values entered into the doctor creation form.
  // ============================================================
  const [formData, setFormData] = useState(initialFormState);

  // ============================================================
  // LOAD DOCTORS
  // Fetches doctors from the API and updates the table and
  // pagination information.
  // ============================================================
  const loadDoctors = async (url = "doctors/", page = 1) => {
    try {
      const response = await getDoctors(url);

      // Extract the paginated results and total count.
      const results = response?.results || [];
      const count = response?.count || 0;

      setDoctors(results);
      setNextPage(response?.next || null);
      setPreviousPage(response?.previous || null);
      setCurrentPage(page);
      setTotalDoctors(count);

      // The backend uses a page size of 10.
      setTotalPages(Math.max(1, Math.ceil(count / 10)));
    } catch (error) {
      console.error("Error fetching doctors:", error);

      setError(getFriendlyErrorMessage(error, "Unable to load doctors. Please check your connection and try again."));

      // Reset the doctor list and pagination if the request fails.
      setDoctors([]);
      setNextPage(null);
      setPreviousPage(null);
      setTotalDoctors(0);
      setTotalPages(1);
    }
  };

  // ============================================================
  // LOAD DEPARTMENTS
  // Fetches departments so the admin can select a department
  // when creating a doctor.
  // ============================================================
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
      setError(getFriendlyErrorMessage(error, "Unable to load departments for the doctor form. Please try again."));
      setDepartments([]);
    }
  };

  // ============================================================
  // INITIAL DATA LOAD
  // Load doctors and departments when the component first mounts.
  // ============================================================
  useEffect(() => {
    loadDoctors();
    loadDepartments();
  }, []);

  // ============================================================
  // HANDLE FORM INPUT CHANGES
  // Updates the corresponding field in formData whenever the
  // administrator changes an input.
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // RESET FORM
  // Closes the form and restores all fields to their initial
  // empty values.
  // ============================================================
  const resetForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
  };

  // ============================================================
  // HANDLE DOCTOR CREATION
  // Validates the form, prepares the API payload, creates the
  // doctor account, and refreshes the doctor list.
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages before starting a new submission.
    setError("");
    setSuccess("");

    // Validate the required doctor fields.
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

      // Prepare the payload expected by the backend.
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

      // Create the doctor through the admin-only service.
      const result = await createDoctorByAdmin(payload);

      // Display the backend warning when available, otherwise
      // show the normal success message.
      setSuccess(
        result?.warning ||
          "Doctor account created. An invite email has been sent so they can set their password.",
      );

      // Reset the form after successful creation.
      resetForm();

      // Refresh the doctor list so the newly created doctor appears.
      await loadDoctors();
    } catch (err) {
      console.error("Create doctor error:", err);

      setError(
        getFriendlyErrorMessage(
          err,
          "Failed to create doctor. Please check the email, department, and license details and try again.",
        ),
      );
    } finally {
      // Re-enable the submit button after the request finishes.
      setSaving(false);
    }
  };

  // ============================================================
  // PAGE LAYOUT
  // ============================================================
  return (
    <div className="container-fluid py-4">
      {/* ========================================================
          PAGE HEADER
          Displays the page title, description, Add Doctor button,
          and total number of doctors.
      ========================================================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Doctors</h2>

          <p className="text-muted mb-0">
            Manage and view registered doctors.
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          {/* Toggle the doctor creation form */}
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

          {/* Display the total number of doctors */}
          <div className="badge bg-primary fs-6 px-3 py-2">
            {totalDoctors} Doctors
          </div>
        </div>
      </div>

      {/* ========================================================
          ALERT MESSAGES
          Displays validation, API, and successful creation
          messages.
      ========================================================= */}
      {error && <div className="alert alert-warning">{error}</div>}

      {success && <div className="alert alert-success">{success}</div>}

      {/* ========================================================
          ADD DOCTOR FORM
          Visible only when showForm is true.
      ========================================================= */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-1">Add Doctor</h5>

            <p className="text-muted small mb-3">
              The doctor will receive an email with a link to set their
              password and activate their account.
            </p>

            <form onSubmit={handleSubmit} className="row g-3">
              {/* First Name */}
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

              {/* Last Name */}
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

              {/* Email */}
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

              {/* Phone Number */}
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

              {/* Department */}
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

              {/* Specialization */}
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

              {/* License Number */}
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

              {/* Years of Experience */}
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

              {/* Form Actions */}
              <div className="col-12 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DOCTORS TABLE
          Displays all doctors returned by the current API page.
      ========================================================= */}
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
                      {/* Doctor Information */}
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

                      {/* Doctor Email */}
                      <td>{doctor.email}</td>

                      {/* Doctor Department */}
                      <td>
                        <span className="badge bg-light text-dark">
                          {doctor.department_name}
                        </span>
                      </td>

                      {/* Doctor Specialization */}
                      <td>
                        <span className="badge bg-info-subtle text-info-emphasis">
                          {doctor.specialization}
                        </span>
                      </td>

                      {/* Years of Experience */}
                      <td>
                        <span className="fw-semibold">
                          {doctor.years_of_experience}
                        </span>{" "}
                        years
                      </td>

                      {/* Medical License */}
                      <td>
                        <code>{doctor.license_number}</code>
                      </td>

                      {/* Doctor Action */}
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Empty state when there are no doctors.
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

      {/* ========================================================
          PAGINATION
          Allows the admin to navigate between pages of doctors.
      ========================================================= */}
      <div className="d-flex justify-content-center align-items-center mt-4">
        <nav>
          <ul className="pagination mb-0">
            {/* Previous Page */}
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

            {/* Next Page */}
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