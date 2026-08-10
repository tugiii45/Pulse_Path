import api from "./api";

export const getAdminDashboardData = async () => {
  const [
    patientsResponse,
    doctorsResponse,
    appointmentsResponse,
    hospitalsResponse,
    departmentsResponse,
  ] = await Promise.all([
    api.get("patients/"),
    api.get("doctors/"),
    api.get("visits/appointments/"),
    api.get("hospitals/"),
    api.get("departments/"),
  ]);

  return {
    patients: patientsResponse.data,
    doctors: doctorsResponse.data,
    appointments: appointmentsResponse.data,
    hospitals: hospitalsResponse.data,
    departments: departmentsResponse.data,
  };
};