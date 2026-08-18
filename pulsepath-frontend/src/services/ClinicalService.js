import api from "./api";


// Clinical Records


/**
 * Fetches all clinical records available
 * to the authenticated user.
 */
export const getClinicalRecords = async () => {
  const response = await api.get("clinical/");
  return response.data;
};

/**
 * Fetches a single clinical record by its ID.
 *
 * @param {string|number} id - Clinical record ID.
 */
export const getClinicalRecord = async (id) => {
  const response = await api.get(`clinical/${id}/`);
  return response.data;
};

/**
 * Creates a new clinical record.
 *
 * @param {Object} data - Clinical record information.
 */
export const createClinicalRecord = async (data) => {
  const response = await api.post("clinical/", data);
  return response.data;
};

/**
 * Partially updates an existing clinical record.
 *
 * @param {string|number} id - Clinical record ID.
 * @param {Object} data - Fields to be updated.
 */
export const updateClinicalRecord = async (id, data) => {
  const response = await api.patch(`clinical/${id}/`, data);
  return response.data;
};

/**
 * Deletes a clinical record by its ID.
 *
 * @param {string|number} id - Clinical record ID.
 */
export const deleteClinicalRecord = async (id) => {
  const response = await api.delete(`clinical/${id}/`);
  return response.data;
};


// ================================
// Diagnoses
// ================================

/**
 * Fetches all diagnoses available
 * to the authenticated user.
 */
export const getDiagnoses = async () => {
  const response = await api.get("clinical/diagnosis/");
  return response.data;
};

/**
 * Fetches a single diagnosis by its ID.
 *
 * @param {string|number} id - Diagnosis ID.
 */
export const getDiagnosis = async (id) => {
  const response = await api.get(`clinical/diagnosis/${id}/`);
  return response.data;
};

/**
 * Creates a new diagnosis.
 *
 * @param {Object} data - Diagnosis information.
 */
export const createDiagnosis = async (data) => {
  const response = await api.post("clinical/diagnosis/", data);
  return response.data;
};

/**
 * Partially updates an existing diagnosis.
 *
 * @param {string|number} id - Diagnosis ID.
 * @param {Object} data - Fields to be updated.
 */
export const updateDiagnosis = async (id, data) => {
  const response = await api.patch(
    `clinical/diagnosis/${id}/`,
    data
  );

  return response.data;
};

/**
 * Deletes a diagnosis by its ID.
 *
 * @param {string|number} id - Diagnosis ID.
 */
export const deleteDiagnosis = async (id) => {
  const response = await api.delete(
    `clinical/diagnosis/${id}/`
  );

  return response.data;
};