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
 * Fetches all visits available to the authenticated user.
 */
export const getVisits = async () => {
  const response = await api.get("visits/");

  return normalizeListResponse(response);
};

/**
 * Fetches a single visit by its ID.
 *
 * @param {string|number} id - Visit ID.
 */
export const getVisit = async (id) => {
  const response = await api.get(`visits/visits/${id}/`);

  return response.data;
};

/**
 * Creates a new visit.
 *
 * @param {Object} data - Visit information.
 */
export const createVisit = async (data) => {
  const response = await api.post("visits/", data);

  return response.data;
};

/**
 * Updates an existing visit.
 *
 * PATCH only changes the fields supplied in the request.
 *
 * @param {string|number} id - Visit ID.
 * @param {Object} data - Fields to update.
 */
export const updateVisit = async (id, data) => {
  const response = await api.patch(
    `visits/visits/${id}/`,
    data
  );

  return response.data;
};

/**
 * Deletes a visit by its ID.
 *
 * @param {string|number} id - Visit ID.
 */
export const deleteVisit = async (id) => {
  const response = await api.delete(
    `visits/visits/${id}/`
  );

  return response.data;
};