import { useEffect, useState } from "react";
import {
  getDepartments,
  createDepartment,
  patchDepartment,
  deleteDepartment,
} from "../../services/departmentService";

function Department() {
  const [departments, setDepartments] = useState([]);

  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDepartments, setTotalDepartments] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hospital: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async (
    url = "departments/",
    page = 1
  ) => {
    try {
      setLoading(true);
      setError("");

      const data = await getDepartments(url);

      console.log(
        "DEPARTMENTS API RESPONSE:",
        data
      );

      setDepartments(data?.results || []);
      setNextPage(data?.next || null);
      setPreviousPage(data?.previous || null);
      setCurrentPage(page);
      setTotalDepartments(data?.count || 0);
      setTotalPages(
        Math.ceil((data?.count || 0) / 10)
      );
    } catch (error) {
      console.error(
        "Failed to fetch departments:",
        error
      );

      setError(
        "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add or edit department
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const departmentData = {
        name: formData.name,
        description: formData.description,
        hospital: Number(formData.hospital),
      };

      if (editingId) {
        await patchDepartment(
          editingId,
          departmentData
        );
      } else {
        await createDepartment(
          departmentData
        );
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        hospital: "",
      });

      setEditingId(null);

      // Reload departments
      await loadDepartments(
        `departments/?page=${currentPage}`,
        currentPage
      );
    } catch (error) {
      console.error(
        "Failed to save department:",
        error
      );

      console.error(
        "Backend error:",
        error.response?.data
      );

      setError(
        error.response?.data?.detail ||
          "Failed to save department."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing
  const handleEdit = (department) => {
    setEditingId(department.id);

    setFormData({
      name: department.name || "",
      description:
        department.description || "",
      hospital: department.hospital || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete department
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteDepartment(id);

      await loadDepartments(
        `departments/?page=${currentPage}`,
        currentPage
      );
    } catch (error) {
      console.error(
        "Failed to delete department:",
        error
      );

      setError(
        "Failed to delete department."
      );
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);

    setFormData({
      name: "",
      description: "",
      hospital: "",
    });
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
            Loading departments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Departments
          </h2>

          <p className="text-muted mb-0">
            Manage hospital departments.
          </p>
        </div>

        <span className="badge bg-primary fs-6 px-3 py-2">
          {totalDepartments} Departments
        </span>

      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            {editingId
              ? "Edit Department"
              : "Add Department"}
          </h5>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="mb-3">

              <label className="form-label fw-semibold">
                Department Name
              </label>

              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Cardiology"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>

            {/* Description */}
            <div className="mb-3">

              <label className="form-label fw-semibold">
                Description
              </label>

              <textarea
                name="description"
                className="form-control"
                rows="3"
                placeholder="Describe the department..."
                value={formData.description}
                onChange={handleChange}
                required
              />

            </div>

            {/* Hospital */}
            <div className="mb-3">

              <label className="form-label fw-semibold">
                Hospital ID
              </label>

              <input
                type="number"
                name="hospital"
                className="form-control"
                placeholder="Enter hospital ID"
                value={formData.hospital}
                onChange={handleChange}
                required
              />

            </div>

            {/* Buttons */}
            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingId
                ? "Update Department"
                : "Add Department"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}

          </form>

        </div>
      </div>

      {/* Department Table */}
      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">

          <h5 className="fw-bold mb-0">
            Department List
          </h5>

          <span className="badge bg-primary">
            {totalDepartments}
          </span>

        </div>

        <div className="card-body p-0">

          {departments.length === 0 ? (

            <div className="text-center py-5">

              <p className="text-muted mb-0">
                No departments found.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th className="px-4">
                      Name
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Hospital
                    </th>

                    <th>
                      Created
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {departments.map(
                    (department) => (

                      <tr
                        key={department.id}
                      >

                        <td className="px-4">
                          <strong>
                            {department.name}
                          </strong>
                        </td>

                        <td>
                          {department.description}
                        </td>

                        <td>
                          <span className="badge bg-light text-dark">
                            {department.hospital_name ||
                              department.hospital ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          {department.created_at
                            ? new Date(
                                department.created_at
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td>

                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() =>
                              handleEdit(
                                department
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(
                                department.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

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
                  loadDepartments(
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

                        if (
                          pageNumber ===
                          currentPage
                        ) {
                          return;
                        }

                        loadDepartments(
                          `departments/?page=${pageNumber}`,
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
                  loadDepartments(
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

export default Department;