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
 * Fetches doctors from the backend.
 *
 * The optional URL parameter allows the function to
 * support different doctor endpoints, including
 * pagination URLs returned by the API.
 *
 * @param {string} url - API endpoint to fetch doctors from.
 */
export const getDoctors = async (url = "doctors/") => {
  const response = await api.get(url);

  return normalizeListResponse(response);
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