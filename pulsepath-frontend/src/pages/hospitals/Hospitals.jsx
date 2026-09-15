import { useEffect, useState } from "react";
import {
  FaEdit,
  FaHospital,
  FaPlus,
  FaRedo,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

import {
  getHospitals,
  createHospital,
  updateHospital,
  patchHospital,
  deleteHospital,
} from "../../services/hospitalService";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

/**
 * Hospitals Page
 *
 * Provides the superadmin with hospital management functionality.
 *
 * The page supports:
 * - Viewing registered hospitals
 * - Adding hospitals
 * - Editing hospitals
 * - Activating/deactivating hospitals
 * - Deleting hospitals
 * - Paginating through hospitals
 */
function Hospitals() {

  // ================================
  // HOSPITAL LIST STATE
  // ================================

  // Stores the hospitals currently displayed in the table.
  const [hospitals, setHospitals] = useState([]);

  // Stores pagination URLs returned by the backend.
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  // Tracks the currently displayed page.
  const [currentPage, setCurrentPage] = useState(1);

  // Stores the calculated number of pages.
  const [totalPages, setTotalPages] = useState(1);

  // Stores the total number of hospitals returned by the API.
  const [totalHospitals, setTotalHospitals] = useState(0);

  // ================================
  // HOSPITAL FORM STATE
  // ================================

  // Stores the values entered into the add/edit hospital form.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    is_active: true,
  });

  // Stores the hospital currently being edited.
  //
  // null means the form is being used to create
  // a new hospital.
  const [editingHospital, setEditingHospital] = useState(null);

  // ================================
  // UI STATE
  // ================================

  // Controls the loading indicator while hospitals are being fetched.
  const [loading, setLoading] = useState(true);

  // Controls the saving state while creating or updating a hospital.
  const [saving, setSaving] = useState(false);

  // Stores error messages displayed to the user.
  const [error, setError] = useState("");

  // ================================
  // INITIAL DATA LOAD
  // ================================

  // Load the first page of hospitals when the component mounts.
  useEffect(() => {
    loadHospitals();
  }, []);

  // ================================
  // LOAD HOSPITALS
  // ================================

  /**
   * Fetches hospitals from the backend.
   *
   * The function accepts:
   * - url: API endpoint or pagination URL
   * - page: page number currently being displayed
   *
   * The backend response is expected to contain:
   * - results
   * - next
   * - previous
   * - count
   */
  const loadHospitals = async (
    url = "hospitals/",
    page = 1
  ) => {
    try {
      setLoading(true);
      setError("");

      // Fetch hospitals from the API.
      const data = await getHospitals(url);

      console.log("HOSPITALS API RESPONSE:", data);

      // Store the current page's hospital records.
      setHospitals(data?.results || []);

      // Store pagination URLs.
      setNextPage(data?.next || null);
      setPreviousPage(data?.previous || null);

      // Update the current page number.
      setCurrentPage(page);

      // Store the total number of hospitals.
      setTotalHospitals(data?.count || 0);

      // Calculate the total number of pages.
      //
      // The page size is currently assumed to be 10 hospitals.
      setTotalPages(
        Math.ceil((data?.count || 0) / 10)
      );

    } catch (err) {
      console.error("Failed to load hospitals:", err);

      // Display a user-friendly error message.
      setError(getFriendlyErrorMessage(err, "Unable to load hospitals. Please check your connection and try again."));

    } finally {
      // Stop the loading indicator regardless of success or failure.
      setLoading(false);
    }
  };

  // ================================
  // FORM INPUT HANDLING
  // ================================

  /**
   * Handles changes to form fields.
   *
   * Text inputs use their value.
   * Checkboxes use their checked state.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ================================
  // RESET FORM
  // ================================

  /**
   * Resets the hospital form to its default values
   * and exits editing mode.
   */
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      is_active: true,
    });

    setEditingHospital(null);
  };

  // ================================
  // CREATE / UPDATE HOSPITAL
  // ================================

  /**
   * Handles submission of the hospital form.
   *
   * If editingHospital exists:
   * - Update the selected hospital.
   *
   * Otherwise:
   * - Create a new hospital.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      // Update an existing hospital.
      if (editingHospital) {
        await updateHospital(
          editingHospital.id,
          formData
        );

      // Create a new hospital.
      } else {
        await createHospital(formData);
      }

      // Clear the form and exit editing mode.
      resetForm();

      // Refresh the hospital list.
      await loadHospitals();

    } catch (err) {
      console.error(
        "Failed to save hospital:",
        err
      );

      setError(
        getFriendlyErrorMessage(
          err,
          "Failed to save hospital. Please check your details and try again.",
        ),
      );

    } finally {
      // Stop the saving indicator.
      setSaving(false);
    }
  };

  // ================================
  // EDIT HOSPITAL
  // ================================

  /**
   * Loads the selected hospital's information
   * into the form and switches the page into edit mode.
   */
  const handleEdit = (hospital) => {
    // Store the hospital currently being edited.
    setEditingHospital(hospital);

    // Populate the form with the hospital's existing data.
    setFormData({
      name: hospital.name || "",
      email: hospital.email || "",
      phone: hospital.phone || "",
      address: hospital.address || "",
      is_active: hospital.is_active,
    });

    // Scroll to the top so the edit form is visible.
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================================
  // TOGGLE HOSPITAL STATUS
  // ================================

  /**
   * Activates or deactivates a hospital.
   *
   * The existing status is reversed and sent to
   * the backend using a PATCH request.
   */
  const handleToggleStatus = async (hospital) => {
    try {
      setError("");

      // Reverse the current active state.
      await patchHospital(hospital.id, {
        is_active: !hospital.is_active,
      });

      // Reload the current page after the update.
      await loadHospitals(
        `hospitals/?page=${currentPage}`,
        currentPage
      );

    } catch (err) {
      console.error(
        "Failed to update hospital status:",
        err
      );

      setError(getFriendlyErrorMessage(err, "Unable to change this hospital's availability. Please try again."));
    }
  };

  // ================================
  // DELETE HOSPITAL
  // ================================

  /**
   * Deletes a hospital after asking the user
   * to confirm the action.
   */
  const handleDelete = async (hospital) => {

    // Ask the user to confirm before deleting.
    const confirmed = window.confirm(
      `Are you sure you want to delete ${hospital.name}?`
    );

    // Stop if the user cancels.
    if (!confirmed) {
      return;
    }

    try {
      setError("");

      // Delete the selected hospital.
      await deleteHospital(hospital.id);

      // Reload the current page after deletion.
      await loadHospitals(
        `hospitals/?page=${currentPage}`,
        currentPage
      );

    } catch (err) {
      console.error(
        "Failed to delete hospital:",
        err
      );

      setError(getFriendlyErrorMessage(err, "Unable to delete this hospital. It may still contain departments or records."));
    }
  };

  // ================================
  // LOADING STATE
  // ================================

  // Display a loading screen while the initial
  // hospital data is being fetched.
  if (loading) {
    return (
      <div className="container-fluid py-4">

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3">
            Loading hospitals...
          </p>

        </div>

      </div>
    );
  }

  // ================================
  // MAIN PAGE
  // ================================

  return (
    <div className="container-fluid py-4">

      {/* =========================
          PAGE HEADER
          Displays the page title,
          description, and refresh button.
      ========================== */}

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>

          <div className="d-flex align-items-center gap-2">

            <FaHospital className="text-primary" />

            <h2 className="fw-bold mb-1">
              Hospitals
            </h2>

          </div>

          <p className="text-muted mb-0">
            Manage hospitals registered in
            PulsePath.
          </p>

        </div>

        {/* Refresh the currently selected page. */}
        <button
          className="btn btn-outline-secondary mt-3 mt-md-0"
          onClick={() =>
            loadHospitals(
              `hospitals/?page=${currentPage}`,
              currentPage
            )
          }
        >
          <FaRedo className="me-2" />
          Refresh
        </button>

      </div>

      {/* =========================
          ERROR ALERT
          Displays API or operation
          errors to the user.
      ========================== */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* =========================
          HOSPITAL FORM
          Used for both creating and
          editing hospitals.
      ========================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white py-3">

          <h5 className="fw-bold mb-0">
            {editingHospital
              ? "Edit Hospital"
              : "Add Hospital"}
          </h5>

        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* Hospital Name */}
              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Hospital Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                  required
                />

              </div>

              {/* Hospital Email */}
              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hospital@example.com"
                  required
                />

              </div>

              {/* Hospital Phone */}
              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Phone
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />

              </div>

              {/* Hospital Address */}
              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Address
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter hospital address"
                  required
                />

              </div>

              {/* Hospital Active Status */}
              <div className="col-12 mb-3">

                <div className="form-check form-switch">

                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    id="hospitalActive"
                  />

                  <label
                    className="form-check-label"
                    htmlFor="hospitalActive"
                  >
                    Hospital is active
                  </label>

                </div>

              </div>

            </div>

            {/* =========================
                FORM ACTIONS
            ========================== */}

            <div className="d-flex gap-2">

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                <FaPlus className="me-2" />

                {saving
                  ? "Saving..."
                  : editingHospital
                  ? "Update Hospital"
                  : "Add Hospital"}

              </button>

              {/* Show cancel only while editing. */}
              {editingHospital && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>
      </div>

      {/* =========================
          HOSPITAL LIST
          Displays all hospitals returned
          for the current page.
      ========================== */}

      <div className="card border-0 shadow-sm">

        {/* Hospital list header */}
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">

          <h5 className="fw-bold mb-0">
            Hospital List
          </h5>

          <span className="badge bg-primary">
            {totalHospitals} Hospitals
          </span>

        </div>

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              {/* =========================
                  TABLE HEADER
              ========================== */}

              <thead className="table-light">

                <tr>
                  <th>ID</th>
                  <th>Hospital</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>

              </thead>

              {/* =========================
                  TABLE BODY
              ========================== */}

              <tbody>

                {hospitals.length > 0 ? (

                  // Render each hospital as a table row.
                  hospitals.map((hospital) => (

                    <tr key={hospital.id}>

                      {/* Hospital ID */}
                      <td>
                        {hospital.id}
                      </td>

                      {/* Hospital name and icon */}
                      <td>

                        <div className="d-flex align-items-center gap-2">

                          <div
                            className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                            style={{
                              width: "40px",
                              height: "40px",
                            }}
                          >
                            <FaHospital />
                          </div>

                          <strong>
                            {hospital.name}
                          </strong>

                        </div>

                      </td>

                      {/* Hospital email */}
                      <td>
                        {hospital.email}
                      </td>

                      {/* Hospital phone */}
                      <td>
                        {hospital.phone}
                      </td>

                      {/* Hospital address */}
                      <td>
                        {hospital.address}
                      </td>

                      {/* Active/inactive status */}
                      <td>

                        {hospital.is_active ? (

                          <span className="badge bg-success-subtle text-success">
                            Active
                          </span>

                        ) : (

                          <span className="badge bg-danger-subtle text-danger">
                            Inactive
                          </span>

                        )}

                      </td>

                      {/* Creation date */}
                      <td>

                        {hospital.created_at
                          ? new Date(
                              hospital.created_at
                            ).toLocaleDateString()
                          : "—"}

                      </td>

                      {/* Hospital actions */}
                      <td>

                        <div className="d-flex gap-2">

                          {/* Edit */}
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit"
                            onClick={() =>
                              handleEdit(hospital)
                            }
                          >
                            <FaEdit />
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            className={`btn btn-sm ${
                              hospital.is_active
                                ? "btn-outline-warning"
                                : "btn-outline-success"
                            }`}
                            title={
                              hospital.is_active
                                ? "Deactivate"
                                : "Activate"
                            }
                            onClick={() =>
                              handleToggleStatus(
                                hospital
                              )
                            }
                          >

                            {hospital.is_active ? (
                              <FaToggleOn />
                            ) : (
                              <FaToggleOff />
                            )}

                          </button>

                          {/* Delete */}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() =>
                              handleDelete(hospital)
                            }
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  /* =========================
                     EMPTY STATE
                  ========================== */

                  <tr>

                    <td
                      colSpan="8"
                      className="text-center py-5"
                    >

                      <FaHospital
                        className="text-muted mb-3"
                        size={30}
                      />

                      <p className="text-muted mb-0">
                        No hospitals found.
                      </p>

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
          hospital result pages.
      ========================== */}

      <div className="d-flex justify-content-center align-items-center mt-4">

        <nav>

          <ul className="pagination mb-0">

            {/* =========================
                PREVIOUS PAGE
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
                disabled={!previousPage}
                onClick={() =>
                  loadHospitals(
                    previousPage,
                    currentPage - 1
                  )
                }
              >
                Previous
              </button>

            </li>

            {/* =========================
                PAGE NUMBERS
            ========================== */}

            {Array.from(
              { length: totalPages },
              (_, index) => {

                const pageNumber = index + 1;

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

                        // Do nothing if the selected
                        // page is already displayed.
                        if (
                          pageNumber ===
                          currentPage
                        ) {
                          return;
                        }

                        // Load the selected page.
                        loadHospitals(
                          `hospitals/?page=${pageNumber}`,
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
                NEXT PAGE
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
                disabled={!nextPage}
                onClick={() =>
                  loadHospitals(
                    nextPage,
                    currentPage + 1
                  )
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

export default Hospitals;

