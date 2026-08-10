import { useEffect, useState } from "react";
import {
  getDepartments,
  createDepartment,
  patchDepartment,
  deleteDepartment,
} from "../../services/departmentService";

function Department() {
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hospital: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();

      console.log("DEPARTMENTS API RESPONSE:", data);

      setDepartments(data.results || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
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

      const departmentData = {
        name: formData.name,
        description: formData.description,
        hospital: Number(formData.hospital),
      };

      if (editingId) {
        // Edit department
        await patchDepartment(editingId, departmentData);
      } else {
        // Add department
        await createDepartment(departmentData);
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        hospital: "",
      });

      setEditingId(null);

      // Reload departments
      await loadDepartments();

    } catch (error) {
      console.error("Failed to save department:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing
  const handleEdit = (department) => {
    setEditingId(department.id);

    setFormData({
      name: department.name,
      description: department.description,
      hospital: department.hospital,
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

    if (!confirmed) return;

    try {
      await deleteDepartment(id);

      await loadDepartments();
    } catch (error) {
      console.error("Failed to delete department:", error);
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
    return <p>Loading departments...</p>;
  }

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Departments</h2>
          <p className="text-muted mb-0">
            Manage hospital departments.
          </p>
        </div>
      </div>

      {/* Add / Edit Form */}
      <div className="card mb-4">
        <div className="card-body">

          <h5 className="card-title mb-3">
            {editingId ? "Edit Department" : "Add Department"}
          </h5>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="mb-3">
              <label className="form-label">
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
              <label className="form-label">
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
              <label className="form-label">
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
      <div className="card">
        <div className="card-body">

          <h5 className="card-title mb-3">
            Department List
          </h5>

          {departments.length === 0 ? (
            <p className="text-muted">
              No departments found.
            </p>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Hospital</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {departments.map((department) => (
                    <tr key={department.id}>

                      <td>
                        <strong>{department.name}</strong>
                      </td>

                      <td>
                        {department.description}
                      </td>

                      <td>
                        {department.hospital_name}
                      </td>

                      <td>
                        {new Date(
                          department.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(department)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDelete(department.id)
                          }
                        >
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default Department;