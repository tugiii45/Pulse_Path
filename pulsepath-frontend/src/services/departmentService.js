import api from "./api";

/**
 * Fetches departments from the backend.
 *
 * Returns the complete API response so that
 * pagination data such as results, count,
 * next, and previous is preserved.
 *
 * @param {string} url - API endpoint.
 */
export const getDepartments = async (
  url = "departments/"
) => {
  const response = await api.get(url);

  return response.data?.data ?? response.data;
};

/**
 * Creates a new department.
 *
 * @param {Object} departmentData - Information
 * for the new department.
 */
export const createDepartment = async (
  departmentData
) => {
  const response = await api.post(
    "departments/",
    departmentData
  );

  return response.data?.data ?? response.data;
};

/**
 * Fully updates an existing department.
 *
 * PUT replaces the department resource with
 * the supplied data.
 *
 * @param {string|number} id - Department ID.
 * @param {Object} departmentData - Complete
 * department information.
 */
export const updateDepartment = async (
  id,
  departmentData
) => {
  const response = await api.put(
    `departments/${id}/`,
    departmentData
  );

  return response.data?.data ?? response.data;
};

/**
 * Partially updates an existing department.
 *
 * PATCH only changes the fields provided.
 *
 * @param {string|number} id - Department ID.
 * @param {Object} departmentData - Fields to
 * be updated.
 */
export const patchDepartment = async (
  id,
  departmentData
) => {
  const response = await api.patch(
    `departments/${id}/`,
    departmentData
  );

  return response.data?.data ?? response.data;
};

/**
 * Deletes a department by its ID.
 *
 * @param {string|number} id - Department ID.
 */
export const deleteDepartment = async (id) => {
  const response = await api.delete(
    `departments/${id}/`
  );

  return response.data?.data ?? response.data;
};