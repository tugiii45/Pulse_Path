import { useEffect, useState } from "react";
import { createPatient, getPatients } from "../../services/PatientService";

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

function Patients() {
  const [patients, setPatients] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState(initialFormState);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.date_of_birth || !formData.emergency_contact) {
      setError("Please fill out the required patient fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

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
        emergency_contact: formData.emergency_contact,
        address: formData.address,
      };

      await createPatient(payload);
      setSuccess("Patient added successfully.");
      setFormData(initialFormState);
      setShowForm(false);
      await loadPatients();
    } catch (err) {
      console.error("Create patient error:", err);
      const backendMessage = err?.response?.data?.errors || err?.response?.data?.message;
      setError(typeof backendMessage === "string" ? backendMessage : "Failed to create patient.");
    } finally {
      setSaving(false);
    }
  };

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

        <div className="d-flex gap-2 align-items-center">
          <button className="btn btn-primary" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Close" : "+ Add Patient"}
          </button>
          <div className="badge bg-primary fs-6 px-3 py-2">
            {patients.length} Patients
          </div>
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Add Patient</h5>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">First Name</label>
                <input className="form-control" name="first_name" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Last Name</label>
                <input className="form-control" name="last_name" value={formData.last_name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Password</label>
                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone Number</label>
                <input className="form-control" name="phone_number" value={formData.phone_number} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Date of Birth</label>
                <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Gender</label>
                <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Blood Group</label>
                <input className="form-control" name="blood_group" value={formData.blood_group} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Emergency Contact</label>
                <input className="form-control" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Address</label>
                <input className="form-control" name="address" value={formData.address} onChange={handleChange} />
              </div>
              <div className="col-12 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Create Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
