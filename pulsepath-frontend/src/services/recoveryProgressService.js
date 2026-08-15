import api from "./api";

// Normalize different response formats returned by the backend.
const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  return [];
};


// Get recovery progress entries.
export const getRecoveryProgress = async (params = {}) => {
  const response = await api.get(
    "treatment/recovery_progress/",
    { params }
  );

  return normalizeListResponse(response);
};


// Get one recovery progress entry.
export const getRecoveryProgressEntry = async (id) => {
  const response = await api.get(
    `treatment/recovery_progress/${id}/`
  );

  return response?.data?.data ?? response?.data;
};


// Create recovery progress.
export const createRecoveryProgress = async (data) => {
  const response = await api.post(
    "treatment/recovery_progress/",
    data
  );

  return response?.data?.data ?? response?.data;
};


// Update recovery progress.
export const updateRecoveryProgress = async (id, data) => {
  const response = await api.patch(
    `treatment/recovery_progress/${id}/`,
    data
  );

  return response?.data?.data ?? response?.data;
};


// Delete recovery progress.
export const deleteRecoveryProgress = async (id) => {
  await api.delete(
    `treatment/recovery_progress/${id}/`
  );
};