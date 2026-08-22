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
 * Fetches recovery progress entries.
 *
 * @param {Object} params - Optional query parameters
 * used to filter or retrieve specific recovery records.
 */
export const getRecoveryProgress = async (params = {}) => {
  const response = await api.get(
    "treatment/recovery_progress/",
    { params }
  );

  return normalizeListResponse(response);
};

/**
 * Fetches a single recovery progress entry by its ID.
 *
 * @param {string|number} id - Recovery progress ID.
 */
export const getRecoveryProgressEntry = async (id) => {
  const response = await api.get(
    `treatment/recovery_progress/${id}/`
  );

  return response?.data?.data ?? response?.data;
};

/**
 * Creates a new recovery progress entry.
 *
 * @param {Object} data - Recovery progress information.
 */
export const createRecoveryProgress = async (data) => {
  const response = await api.post(
    "treatment/recovery_progress/",
    data
  );

  return response?.data?.data ?? response?.data;
};

/**
 * Updates an existing recovery progress entry.
 *
 * PATCH updates only the fields supplied in the request.
 *
 * For doctors/admins, this is also used to submit:
 * - is_reviewed
 * - doctor_response
 *
 * @param {string|number} id - Recovery progress ID.
 * @param {Object} data - Fields to update.
 */
export const updateRecoveryProgress = async (id, data) => {
  const response = await api.patch(
    `treatment/recovery_progress/${id}/`,
    data
  );

  return response?.data?.data ?? response?.data;
};

/**
 * Deletes a recovery progress entry by its ID.
 *
 * @param {string|number} id - Recovery progress ID.
 */
export const deleteRecoveryProgress = async (id) => {
  await api.delete(
    `treatment/recovery_progress/${id}/`
  );
};