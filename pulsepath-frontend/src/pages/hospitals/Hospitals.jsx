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

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);

  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHospitals, setTotalHospitals] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    is_active: true,
  });

  const [editingHospital, setEditingHospital] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async (
    url = "hospitals/",
    page = 1
  ) => {
    try {
      setLoading(true);
      setError("");

      const data = await getHospitals(url);

      console.log("HOSPITALS API RESPONSE:", data);

      setHospitals(data?.results || []);
      setNextPage(data?.next || null);
      setPreviousPage(data?.previous || null);
      setCurrentPage(page);
      setTotalHospitals(data?.count || 0);
      setTotalPages(
        Math.ceil((data?.count || 0) / 10)
      );
    } catch (err) {
      console.error("Failed to load hospitals:", err);
      setError("Failed to load hospitals.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingHospital) {
        await updateHospital(
          editingHospital.id,
          formData
        );
      } else {
        await createHospital(formData);
      }

      resetForm();
      await loadHospitals();
    } catch (err) {
      console.error(
        "Failed to save hospital:",
        err
      );

      console.error(
        "Backend error:",
        err.response?.data
      );

      setError(
        err.response?.data?.detail ||
          "Failed to save hospital."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);

    setFormData({
      name: hospital.name || "",
      email: hospital.email || "",
      phone: hospital.phone || "",
      address: hospital.address || "",
      is_active: hospital.is_active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleToggleStatus = async (hospital) => {
    try {
      setError("");

      await patchHospital(hospital.id, {
        is_active: !hospital.is_active,
      });

      await loadHospitals(
        `hospitals/?page=${currentPage}`,
        currentPage
      );
    } catch (err) {
      console.error(
        "Failed to update hospital status:",
        err
      );

      setError(
        "Failed to update hospital status."
      );
    }
  };

  const handleDelete = async (hospital) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${hospital.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteHospital(hospital.id);

      await loadHospitals(
        `hospitals/?page=${currentPage}`,
        currentPage
      );
    } catch (err) {
      console.error(
        "Failed to delete hospital:",
        err
      );

      setError(
        "Failed to delete hospital."
      );
    }
  };

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

  return (
    <div className="container-fluid py-4">

      {/* Header */}
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

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Hospital Form */}
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

              {/* Name */}
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

              {/* Email */}
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

              {/* Phone */}
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

              {/* Address */}
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

              {/* Active */}
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

      {/* Hospital List */}
      <div className="card border-0 shadow-sm">

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

              <tbody>

                {hospitals.length > 0 ? (

                  hospitals.map((hospital) => (

                    <tr key={hospital.id}>

                      <td>
                        {hospital.id}
                      </td>

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

                      <td>
                        {hospital.email}
                      </td>

                      <td>
                        {hospital.phone}
                      </td>

                      <td>
                        {hospital.address}
                      </td>

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

                      <td>
                        {hospital.created_at
                          ? new Date(
                              hospital.created_at
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit"
                            onClick={() =>
                              handleEdit(hospital)
                            }
                          >
                            <FaEdit />
                          </button>

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

      {/* Pagination */}
      <div className="d-flex justify-content-center align-items-center mt-4">
        <nav>
          <ul className="pagination mb-0">

            {/* Previous */}
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

            {/* Page Numbers */}
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
                        if (
                          pageNumber ===
                          currentPage
                        ) {
                          return;
                        }

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

            {/* Next */}
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