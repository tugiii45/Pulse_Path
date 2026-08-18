import api from "./api";

/**
 * Normalizes different API response formats into a consistent array.
 *
 * The backend may return:
 * - A direct array
 * - Data wrapped inside `data`
 * - A paginated response inside `results`
 * - An array inside `data`
 *
 * This allows components to safely work with an array
 * regardless of the backend response structure.
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
 * Fetch all appointments available to the authenticated user.
 */
export const getAppointments = async () => {
  const response = await api.get("visits/appointments/");
  return normalizeListResponse(response);
};

/**
 * Fetch a single appointment by its ID.
 */
export const getAppointment = async (id) => {
  const response = await api.get(`visits/appointments/${id}/`);

  // Return the actual appointment data regardless
  // of whether the backend wraps it inside `data`.
  return response.data?.data ?? response.data;
};

/**
 * Create a new appointment.
 *
 * @param {Object} data - Appointment information
 * submitted to the backend.
 */
export const createAppointment = async (data) => {
  const response = await api.post("visits/appointments/", data);

  return response.data?.data ?? response.data;
};

/**
 * Update an existing appointment.
 *
 * @param {string|number} id - Appointment ID
 * @param {Object} data - Fields to update
 */
export const updateAppointment = async (id, data) => {
  const response = await api.patch(
    `visits/appointments/${id}/`,
    data
  );

  return response.data?.data ?? response.data;
};

/**
 * Delete an appointment by its ID.
 *
 * No response data is returned because the appointment
 * is simply removed from the backend.
 */
export const deleteAppointment = async (id) => {
  await api.delete(`visits/appointments/${id}/`);
};