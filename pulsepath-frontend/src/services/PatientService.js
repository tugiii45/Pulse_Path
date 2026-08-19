import api from "./api";

/**
 * Fetches patients from the backend.
 *
 * Returns the complete API payload so pagination
 * information such as results, count, next,
 * and previous is preserved.
 *
 * @param {string} url - API endpoint to fetch patients from.
 */
export const getPatients = async (url = "patients/") => {
  const response = await api.get(url);

  return response.data?.data ?? response.data;
};

/**
 * Fetches the authenticated patient's own profile.
 *
 * Returns the Patient record linked to the current user.
 */
export const getMyPatientProfile = async () => {
  const response = await api.get("patient_profile/");

  return response.data?.data ?? response.data;
};

/**
 * Creates a new patient.
 *
 * @param {Object} data - Patient information.
 */
export const createPatient = async (data) => {
  const response = await api.post("patients/", data);

  return response.data?.data ?? response.data;
};