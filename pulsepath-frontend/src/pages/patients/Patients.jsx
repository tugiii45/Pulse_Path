
import { useEffect, useState } from "react";
import {
  createPatient,
  getPatients,
} from "../../services/PatientService";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

/**
 * Default values for the Add Patient form.
 *
 * This object is also used to reset the form after
 * successfully creating a patient.
 */
const initialFormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
  date_of_birth: "",
  gender: "MALE",
  blood_group: "",
  emergency_contact: "",
  address: "",
};

/**
 * Patients Page
 *
 * Allows an administrator to:
 * - View registered patients
 * - Add new patients
 * - View patient information
 * - Navigate through paginated patient results
 */
function Patients() {
  // Stores the list of patients returned by the API.
  const [patients, setPatients] = useState([]);

  // Stores the URL for the next page of patients.
  const [nextPage, setNextPage] = useState(null);

  // Stores the URL for the previous page of patients.
  const [previousPage, setPreviousPage] = useState(null);

  // Tracks the currently displayed page number.
  const [currentPage, setCurrentPage] = useState(1);

  // Stores the total number of pages calculated from the API count.
  const [totalPages, setTotalPages] = useState(1);

  // Stores the total number of registered patients.
  const [totalPatients, setTotalPatients] = useState(0);

  // Controls whether the Add Patient form is visible.
  const [showForm, setShowForm] = useState(false);

  // Tracks whether the patient creation request is currently running.
  const [saving, setSaving] = useState(false);

  // Stores an error message to display to the user.
  const [error, setError] = useState("");

  // Stores a success message after a patient is created.
  const [success, setSuccess] = useState("");

  // Stores the values entered into the Add Patient form.
  const [formData, setFormData] =
    useState(initialFormState);

  /**
   * Load patients from the backend.
   *
   * @param {string} url - API URL or endpoint to request.
   * @param {number} page - Page number currently being displayed.
   *
   * The backend response is expected to contain:
   * - results: patients for the current page
   * - count: total number of patients
   * - next: URL for the next page
   * - previous: URL for the previous page
   */
  const loadPatients = async (
    url = "patients/",
    page = 1
  ) => {
    try {
      // Request the patient list from the backend.
      const response = await getPatients(url);

      // Extract the patients from the paginated response.
      const results = response?.results || [];

      // Extract the total patient count.
      const count = response?.count || 0;

      // Update the displayed patient list.
      setPatients(results);

      // Store pagination URLs returned by the backend.
      setNextPage(response?.next || null);
      setPreviousPage(response?.previous || null);

      // Update the currently displayed page.
      setCurrentPage(page);

      // Update the total number of patients.
      setTotalPatients(count);

      // Calculate the number of pages.
      //
      // The current implementation assumes that the API
      // returns 10 patients per page.
      setTotalPages(
        Math.max(1, Math.ceil(count / 10))
      );
    } catch (error) {
      console.error(
        "Error fetching patients:",
        error
      );

      setError(getFriendlyErrorMessage(error, "Unable to load patients. Please check your connection and try again."));

      // Clear patient data if the request fails.
      setPatients([]);

      // Clear pagination information.
      setNextPage(null);
      setPreviousPage(null);

      // Reset patient count and pagination.
      setTotalPatients(0);
      setTotalPages(1);
    }
  };

  /**
   * Load the first page of patients when the component
   * is initially rendered.
   */
  useEffect(() => {
    loadPatients();
  }, []);

  /**
   * Handle changes to any field in the patient form.
   *
   * The input's "name" attribute determines which property
   * in formData should be updated.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle submission of the Add Patient form.
   *
   * Performs basic frontend validation before sending
   * the patient information to the backend.
   */
  const handleSubmit = async (e) => {
    // Prevent the browser from performing a normal form submission.
    e.preventDefault();

    /**
     * Check that all required patient fields have been filled.
     *
     * These checks provide immediate feedback before
     * making an API request.
     */
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.password ||
      !formData.date_of_birth ||
      !formData.emergency_contact
    ) {
      setError(
        "Please fill out the required patient fields."
      );

      return;
    }

    try {
      // Show the saving state and clear previous messages.
      setSaving(true);
      setError("");
      setSuccess("");

      /**
       * Prepare the patient data expected by the backend.
       *
       * The role is explicitly set to PATIENT because
       * this page is used to create patient accounts.
       */
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        role: "PATIENT",
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        blood_group: formData.blood_group,
        emergency_contact:
          formData.emergency_contact,
        address: formData.address,
      };

      // Send the new patient information to the backend.
      await createPatient(payload);

      // Display a success message after creation.
      setSuccess(
        "Patient added successfully."
      );

      // Reset the form to its initial values.
      setFormData(initialFormState);

      // Close the Add Patient form.
      setShowForm(false);

      // Reload the patient list so the newly created
      // patient appears in the table.
      await loadPatients();
    } catch (err) {
      console.error(
        "Create patient error:",
        err
      );

      setError(
        getFriendlyErrorMessage(
          err,
          "Failed to create patient. Please check the required details and try again.",
        ),
      );
    } finally {
      // Stop the saving indicator regardless of
      // whether the request succeeded or failed.
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* =========================
          PAGE HEADER
          Displays the page title,
          Add Patient button, and
          total patient count.
      ========================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Patients
          </h2>

          <p className="text-muted mb-0">
            Manage and view registered patients.
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">

          {/* Toggle the Add Patient form. */}
          <button
            className="btn btn-primary"
            onClick={() =>
              setShowForm((prev) => !prev)
            }
          >
            {showForm
              ? "Close"
              : "+ Add Patient"}
          </button>

          {/* Display the total number of patients. */}
          <div className="badge bg-primary fs-6 px-3 py-2">
            {totalPatients} Patients
          </div>

        </div>
      </div>

      {/* =========================
          ALERTS
          Displays validation,
          backend errors, and
          success messages.
      ========================== */}

      {error && (
        <div className="alert alert-warning">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* =========================
          ADD PATIENT FORM
          Only displayed when
          showForm is true.
      ========================== */}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-3">
              Add Patient
            </h5>

            <form
              onSubmit={handleSubmit}
              className="row g-3"
            >

              {/* =========================
                  FIRST NAME
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  First Name
                </label>

                <input
                  className="form-control"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* =========================
                  LAST NAME
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Last Name
                </label>

                <input
                  className="form-control"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* =========================
                  EMAIL
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* =========================
                  PASSWORD
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* =========================
                  PHONE NUMBER
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Phone Number
                </label>

                <input
                  className="form-control"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />

              </div>

              {/* =========================
                  DATE OF BIRTH
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Date of Birth
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* =========================
                  GENDER
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Gender
                </label>

                <select
                  className="form-select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="MALE">
                    Male
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>

              </div>

              {/* =========================
                  BLOOD GROUP
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Blood Group
                </label>

                <input
                  className="form-control"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                />

              </div>

              {/* =========================
                  EMERGENCY CONTACT
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Emergency Contact
                </label>

                <input
                  className="form-control"
                  name="emergency_contact"
                  value={
                    formData.emergency_contact
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              {/* =========================
                  ADDRESS
              ========================== */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Address
                </label>

                <input
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />

              </div>

              {/* =========================
                  FORM BUTTONS
              ========================== */}

              <div className="col-12 d-flex justify-content-end gap-2">

                {/* Close the form without creating
                    a patient. */}
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                {/* Submit the form and create
                    the patient account. */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Create Patient"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================
          PATIENTS TABLE
          Displays the patients returned
          by the current API page.
      ========================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              {/* =========================
                  TABLE HEADER
              ========================== */}

              <thead className="table-light">

                <tr>

                  <th className="px-4">
                    Patient
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Date of Birth
                  </th>

                  <th>
                    Gender
                  </th>

                  <th>
                    Blood Group
                  </th>

                  <th>
                    Emergency Contact
                  </th>

                  <th className="text-center">
                    Action
                  </th>

                </tr>

              </thead>

              {/* =========================
                  TABLE BODY
              ========================== */}

              <tbody>

                {/* Display patients when the
                    current page contains results. */}
                {patients.length > 0 ? (

                  patients.map((patient) => (

                    <tr key={patient.id}>

                      {/* Patient name */}
                      <td className="px-4">

                        <div className="fw-semibold">
                          {patient.full_name}
                        </div>

                      </td>

                      {/* Patient email */}
                      <td>
                        {patient.email}
                      </td>

                      {/* Patient date of birth */}
                      <td>
                        {patient.date_of_birth}
                      </td>

                      {/* Patient gender */}
                      <td>

                        <span className="badge bg-light text-dark">
                          {patient.gender}
                        </span>

                      </td>

                      {/* Patient blood group */}
                      <td>

                        <span className="badge bg-danger">
                          {patient.blood_group}
                        </span>

                      </td>

                      {/* Emergency contact */}
                      <td>
                        {patient.emergency_contact}
                      </td>

                      {/* Patient action */}
                      <td className="text-center">

                        {/* Currently displays a View button.
                            The button does not have an action
                            attached yet. */}
                        <button className="btn btn-sm btn-outline-primary">
                          View
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  /* Display this row when there are
                     no patients to show. */
                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-5"
                    >
                      <div className="text-muted">
                        No patients found.
                      </div>
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =========================
          PAGINATION
          Allows navigation between
          patient result pages.
      ========================== */}

      <div className="d-flex justify-content-center align-items-center mt-4">

        <nav>

          <ul className="pagination mb-0">

            {/* =========================
                PREVIOUS BUTTON
            ========================== */}

            <li
              className={`page-item ${
                !previousPage
                  ? "disabled"
                  : ""
              }`}
            >

              <button
                className="page-link"
                onClick={() =>
                  loadPatients(
                    previousPage,
                    currentPage - 1
                  )
                }
                disabled={!previousPage}
              >
                Previous
              </button>

            </li>

            {/* =========================
                PAGE NUMBERS
                Creates a button for each
                calculated page.
            ========================== */}

            {Array.from(
              { length: totalPages },
              (_, index) => {

                // Convert the zero-based array
                // index into a page number.
                const pageNumber =
                  index + 1;

                return (
                  <li
                    key={pageNumber}
                    className={`page-item ${
                      currentPage ===
                      pageNumber
                        ? "active"
                        : ""
                    }`}
                  >

                    <button
                      className="page-link"
                      onClick={() => {

                        // Do nothing when the user
                        // clicks the page they are
                        // already viewing.
                        if (
                          pageNumber ===
                          currentPage
                        ) {
                          return;
                        }

                        // Request the selected page.
                        loadPatients(
                          `patients/?page=${pageNumber}`,
                          pageNumber
                        );

                      }}
                    >
                      {pageNumber}
                    </button>

                  </li>
                );

              }
            )}

            {/* =========================
                NEXT BUTTON
            ========================== */}

            <li
              className={`page-item ${
                !nextPage
                  ? "disabled"
                  : ""
              }`}
            >

              <button
                className="page-link"
                onClick={() =>
                  loadPatients(
                    nextPage,
                    currentPage + 1
                  )
                }
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

