import api from "./api";

/**
 * Normalizes different API response formats into a consistent array.
 *
 * The backend may return:
 * - A direct array
 * - Data wrapped inside a `data` property
 * - A paginated response inside `results`
 * - An array inside a `data` property
 *
 * This ensures components always receive an array.
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

    // Handle responses such as { data: [...] }.
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  // Return an empty array if no valid list is found.
  return [];
};

/**
 * Fetches all diagnoses available to the
 * authenticated user.
 */
export const getDiagnoses = async () => {
  const response = await api.get("clinical/diagnosis/");

  return normalizeListResponse(response);
};

/**
 * Creates a new diagnosis.
 *
 * @param {Object} diagnosisData - Information
 * required to create the diagnosis.
 */
export const createDiagnosis = async (diagnosisData) => {
  const response = await api.post(
    "clinical/diagnosis/",
    diagnosisData
  );

  return response?.data?.data ?? response?.data;
};