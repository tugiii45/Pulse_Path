
import { useEffect, useState } from "react";
import { getAppointments } from "../../services/AppointmentService";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await getAppointments();

        console.log("APPOINTMENTS API RESPONSE:", response);

        setAppointments(response.data?.results || []);
      } catch (err) {
        console.error("APPOINTMENTS ERROR:", err);
        setError("Failed to load appointments.");
      }
    };

    loadAppointments();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "—";

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) return iso;

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-4">Appointments</h2>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patient_name}</td>
                  <td>{appointment.doctor_name}</td>
                  <td>
                    {formatDate(appointment.appointment_date)}
                  </td>
                  <td>
                    <span className="badge bg-primary">
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Appointments;

