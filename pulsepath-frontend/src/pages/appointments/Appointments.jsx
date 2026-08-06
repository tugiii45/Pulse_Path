import { useEffect, useState } from "react";
import { getAppointments } from "../../services/AppointmentService";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getAppointments();
        const items = Array.isArray(data) ? data : data?.results ?? data ?? [];
        setAppointments(items);
      } catch (error) {
        console.error(error);
        setError(error);
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
    <div className="container-fluid">
      <h2 className="mb-4">Appointments</h2>

      {error && (
        <div className="alert alert-warning" role="alert">
          Failed to load appointments. Please log in again or refresh the page.
        </div>
      )}

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
              <td>{formatDate(appointment.appointment_date)}</td>
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
  );
}

export default Appointments;