import api from "../api";

// Normalize different API response formats
// into a simple array.
const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  // API directly returns an array.
  if (Array.isArray(payload)) {
    return payload;
  }

  // API returns a paginated response:
  // { count, next, previous, results }
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    // Handle APIs that wrap the array inside data.
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  return [];
};

// =========================================================
// TREATMENT
// =========================================================

// Get treatments visible to the current user.
export const getTreatments = async () => {
  const response = await api.get("treatment/");

  return normalizeListResponse(response);
};

// Get one treatment by ID.
export const getTreatment = async (id) => {
  const response = await api.get(`treatment/${id}/`);

  return response.data?.data ?? response.data;
};

export const getPrescription = async (id) => {
  return getTreatment(id);
};

// Create a treatment.
export const createTreatment = async (data) => {
  const response = await api.post("treatment/", data);

  return response.data?.data ?? response.data;
};

// Update a treatment.
export const updateTreatment = async (id, data) => {
  const response = await api.patch(`treatment/${id}/`, data);

  return response.data?.data ?? response.data;
};

// Delete a treatment.
export const deleteTreatment = async (id) => {
  await api.delete(`treatment/${id}/`);
};

// =========================================================
// PRESCRIPTIONS
// =========================================================

// Get prescriptions that can be linked to a treatment.
export const getPrescriptions = async () => {
  const response = await api.get("treatment/prescription/");

  return normalizeListResponse(response);
};