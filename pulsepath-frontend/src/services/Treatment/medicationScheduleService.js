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


// Get all medication schedules.
export const getMedicationSchedules = async (params = {}) => {
  const response = await api.get("treatment/medication_schedule/", {
    params,
  });

  return normalizeListResponse(response);
};


// Get one medication schedule by ID.
export const getMedicationSchedule = async (id) => {
  const response = await api.get(
    `treatment/medication_schedule/${id}/`
  );

  return response?.data?.data ?? response?.data;
};


// Create a new medication schedule.
export const createMedicationSchedule = async (data) => {
  const response = await api.post(
    "treatment/medication_schedule/",
    data
  );

  return response?.data?.data ?? response?.data;
};


// Update an existing medication schedule.
export const updateMedicationSchedule = async (id, data) => {
  const response = await api.patch(
    `treatment/medication_schedule/${id}/`,
    data
  );

  return response?.data?.data ?? response?.data;
};


// Delete a medication schedule.
export const deleteMedicationSchedule = async (id) => {
  await api.delete(
    `treatment/medication_schedule/${id}/`
  );
};