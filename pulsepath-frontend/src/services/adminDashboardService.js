import api from "./api";

/**
 * Normalize API list responses into a consistent format.
 *
 * Supports:
 * - { count, results }
 * - { data: { count, results } }
 * - { data: [...] }
 * - direct arrays
 */
const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      results: payload,
    };
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) {
      return {
        count: payload.count ?? payload.results.length,
        results: payload.results,
      };
    }

    if (Array.isArray(payload.data)) {
      return {
        count: payload.data.length,
        results: payload.data,
      };
    }
  }

  return {
    count: 0,
    results: [],
  };
};

/**
 * Fetches all data required by the Admin Dashboard.
 */
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
    patients: normalizeListResponse(patientsResponse),
    doctors: normalizeListResponse(doctorsResponse),
    appointments: normalizeListResponse(appointmentsResponse),
    hospitals: normalizeListResponse(hospitalsResponse),
    departments: normalizeListResponse(departmentsResponse),
  };
};