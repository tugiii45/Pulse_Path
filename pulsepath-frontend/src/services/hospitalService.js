import api from "./api";

/**
 * Fetches hospitals from the backend.
 *
 * Returns the complete API payload so that
 * pagination information such as results,
 * count, next, and previous is preserved.
 */
export const getHospitals = async (
  url = "hospitals/"
) => {
  const response = await api.get(url);

  return response.data?.data ?? response.data;
};

/**
 * Creates a new hospital.
 *
 * Superadmin-only, direct creation. Admins register their own
 * hospital via registerHospital() instead.
 *
 * @param {Object} hospitalData - Information for the new hospital.
 */
export const createHospital = async (
  hospitalData
) => {
  const response = await api.post(
    "hospitals/",
    hospitalData
  );

  return response.data?.data ?? response.data;
};

/**
 * Admin self-service: registers a hospital and links it to the
 * current admin's account in one step. Fails if the admin already
 * manages a hospital.
 *
 * @param {Object} hospitalData - Information for the new hospital.
 */
export const registerHospital = async (
  hospitalData
) => {
  const response = await api.post(
    "hospitals/register/",
    hospitalData
  );

  return response.data?.data ?? response.data;
};

/**
 * Fully updates an existing hospital.
 *
 * @param {string|number} hospitalId - Hospital ID.
 * @param {Object} hospitalData - Complete hospital information.
 */
export const updateHospital = async (
  hospitalId,
  hospitalData
) => {
  const response = await api.put(
    `hospitals/${hospitalId}/`,
    hospitalData
  );

  return response.data?.data ?? response.data;
};

/**
 * Partially updates an existing hospital.
 *
 * @param {string|number} hospitalId - Hospital ID.
 * @param {Object} hospitalData - Fields to update.
 */
export const patchHospital = async (
  hospitalId,
  hospitalData
) => {
  const response = await api.patch(
    `hospitals/${hospitalId}/`,
    hospitalData
  );

  return response.data?.data ?? response.data;
};

/**
 * Deletes a hospital by its ID.
 *
 * @param {string|number} hospitalId - Hospital ID.
 */
export const deleteHospital = async (
  hospitalId
) => {
  const response = await api.delete(
    `hospitals/${hospitalId}/`
  );

  return response.data?.data ?? response.data;
};