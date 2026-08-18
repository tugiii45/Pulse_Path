import api from "./api";

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


// Get all medication logs.
export const getMedicationLogs = async (params = {}) => {
  const response = await api.get("treatment/medication_log/", {
    params,
  });

  return normalizeListResponse(response);
};


// Get one medication log by ID.
export const getMedicationLog = async (id) => {
  const response = await api.get(
    `treatment/medication_log/${id}/`
  );

  return response?.data?.data ?? response?.data;
};


// Create a new medication log.
export const createMedicationLog = async (data) => {
  const response = await api.post(
    "treatment/medication_log/",
    data
  );

  return response?.data?.data ?? response?.data;
};


// Update an existing medication log.
export const updateMedicationLog = async (id, data) => {
  const response = await api.patch(
    `treatment/medication_log/${id}/`,
    data
  );

  return response?.data?.data ?? response?.data;
};


// Delete a medication log.
export const deleteMedicationLog = async (id) => {
  await api.delete(
    `treatment/medication_log/${id}/`
  );
};