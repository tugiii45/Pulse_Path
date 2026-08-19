import api from "./api";

/**
 * Fetches doctors from the backend.
 *
 * Returns the complete API payload so that
 * pagination information such as results,
 * count, next, and previous is preserved.
 *
 * @param {string} url - API endpoint to fetch doctors from.
 */
export const getDoctors = async (url = "doctors/") => {
  const response = await api.get(url);

  return response.data?.data ?? response.data;
};

/**
 * Fetches doctors belonging to a specific hospital.
 *
 * @param {number|string} hospitalId - Hospital primary key.
 */
export const getDoctorsByHospital = async (hospitalId) => {
  if (!hospitalId) {
    return [];
  }

  const response = await api.get(
    `doctors/by-hospital/?hospital=${hospitalId}`,
  );

  const payload = response.data?.data ?? response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  return [];
};

/**
 * Creates a new doctor.
 *
 * @param {Object} data - Doctor information.
 */
export const createDoctor = async (data) => {
  const response = await api.post("doctors/", data);

  return response.data?.data ?? response.data;
};