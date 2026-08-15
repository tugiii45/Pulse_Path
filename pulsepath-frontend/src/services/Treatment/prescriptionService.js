import api from "./api";

// Normalize paginated and non-paginated API responses.
const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  // API returned a direct array.
  if (Array.isArray(payload)) {
    return payload;
  }

  // API returned a paginated response.
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    // Handle another possible wrapped response.
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  return [];
};


// Get prescriptions for the current user's hospital.
export const getPrescriptions = async () => {
  const response = await api.get("treatment/prescription/");

  return normalizeListResponse(response);
};


// Get one prescription by ID.
export const getPrescription = async (id) => {
  const response = await api.get(
    `treatment/prescription/${id}/`
  );

  return response?.data?.data ?? response?.data;
};


// Create a prescription.
export const createPrescription = async (data) => {
  const response = await api.post(
    "treatment/prescription/",
    data
  );

  return response?.data?.data ?? response?.data;
};


// Update a prescription.
export const updatePrescription = async (id, data) => {
  const response = await api.patch(
    `treatment/prescription/${id}/`,
    data
  );

  return response?.data?.data ?? response?.data;
};


// Delete a prescription.
export const deletePrescription = async (id) => {
  await api.delete(
    `treatment/prescription/${id}/`
  );
};