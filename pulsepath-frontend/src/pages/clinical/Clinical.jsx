import { Link } from "react-router-dom";
import {
  FaUserMd,
  FaFileMedical,
  FaClipboardList,
  FaVial,
  FaMicroscope,
} from "react-icons/fa";

function Clinical() {
  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Clinical</h2>
        <p className="text-muted mb-0">
          View and manage your clinical information.
        </p>
      </div>

      {/* Clinical Cards */}
      <div className="row g-4">

        {/* Medical Records */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <FaFileMedical size={38} className="text-primary mb-3" />

              <h5 className="fw-bold">Medical Records</h5>

              <p className="text-muted small">
                View your medical history, consultations, and clinical notes.
              </p>

              <Link
                to="/dashboard/clinical/medical-records"
                className="btn btn-outline-primary btn-sm"
              >
                View Records
              </Link>
            </div>
          </div>
        </div>

        {/* Diagnoses */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <FaClipboardList size={38} className="text-primary mb-3" />

              <h5 className="fw-bold">Diagnoses</h5>

              <p className="text-muted small">
                Review diagnoses made by your healthcare providers.
              </p>

              <Link
                to="/dashboard/clinical/diagnosis"
                className="btn btn-outline-primary btn-sm"
              >
                View Diagnoses
              </Link>
            </div>
          </div>
        </div>

        {/* Lab Tests */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <FaVial size={38} className="text-primary mb-3" />

              <h5 className="fw-bold">Lab Tests</h5>

              <p className="text-muted small">
                View laboratory tests requested by your healthcare provider.
              </p>

              <Link
                to="/clinical/lab-tests"
                className="btn btn-outline-primary btn-sm"
              >
                View Tests
              </Link>
            </div>
          </div>
        </div>

        {/* Lab Results */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <FaMicroscope size={38} className="text-primary mb-3" />

              <h5 className="fw-bold">Lab Results</h5>

              <p className="text-muted small">
                Review completed laboratory results and findings.
              </p>

              <Link
                to="/clinical/lab-results"
                className="btn btn-outline-primary btn-sm"
              >
                View Results
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Clinical Activity */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            <FaUserMd className="me-2 text-primary" />
            Recent Clinical Activity
          </h5>

          <div className="text-center py-4">
            <p className="text-muted mb-0">
              No recent clinical activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Clinical;