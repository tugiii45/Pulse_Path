import api from "./api";

/**
 * Normalizes different API response formats into a consistent array.
 *
 * Supports:
 * - Direct array responses
 * - Responses wrapped in `data`
 * - Paginated responses using `results`
 */
const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  // Handle a direct array response.
  if (Array.isArray(payload)) {
    return payload;
  }

  // Handle object-based API responses.
  if (payload && typeof payload === "object") {
    // Handle paginated responses such as { results: [...] }.
    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    // Handle responses containing an array in `data`.
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  // Return an empty array when no valid list is found.
  return [];
};

/**
 * Fetches patients from the backend.
 *
 * The optional URL parameter allows the function to
 * support pagination URLs returned by the API.
 *
 * @param {string} url - API endpoint to fetch patients from.
 */
export const getPatients = async (url = "patients/") => {
  const response = await api.get(url);

  return normalizeListResponse(response);
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