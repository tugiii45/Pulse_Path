import api from "../api";

// Normalize the different response formats returned by the backend.
const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  // If the API directly returns an array.
  if (Array.isArray(payload)) {
    return payload;
  }

  // Handle paginated responses.
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    // Handle APIs that wrap the list inside "data".
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  // Return an empty array instead of crashing the component.
  return [];
};


// Get all medications available to the current user's hospital.
export const getMedications = async () => {
  const response = await api.get("treatment/medication/");
  return normalizeListResponse(response);
};


// Get one medication by ID.
export const getMedication = async (id) => {
  const response = await api.get(`treatment/medication/${id}/`);

  return response?.data?.data ?? response?.data;
};


// Create a new medication.
export const createMedication = async (data) => {
  const response = await api.post("treatment/medication/", data);

  return response?.data?.data ?? response?.data;
};


// Update an existing medication.
export const updateMedication = async (id, data) => {
  const response = await api.patch(
    `treatment/medication/${id}/`,
    data
  );

  return response?.data?.data ?? response?.data;
};


// Delete a medication.
export const deleteMedication = async (id) => {
  await api.delete(`treatment/medication/${id}/`);
};