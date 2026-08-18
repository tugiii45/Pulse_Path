import api from "./api";

/**
 * Fetches all hospitals available from the backend.
 */
export const getHospitals = async () => {
  const response = await api.get("hospitals/");

  return response.data;
};

/**
 * Creates a new hospital.
 *
 * @param {Object} hospitalData - Information for the new hospital.
 */
export const createHospital = async (hospitalData) => {
  const response = await api.post(
    "hospitals/",
    hospitalData
  );

  return response.data;
};

/**
 * Fully updates an existing hospital.
 *
 * PUT replaces the existing hospital resource
 * with the supplied data.
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

  return response.data;
};

/**
 * Partially updates an existing hospital.
 *
 * PATCH only changes the fields provided.
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

  return response.data;
};

/**
 * Deletes a hospital by its ID.
 *
 * @param {string|number} hospitalId - Hospital ID.
 */
export const deleteHospital = async (hospitalId) => {
  const response = await api.delete(
    `hospitals/${hospitalId}/`
  );

  return response.data;
};