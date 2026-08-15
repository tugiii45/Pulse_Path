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

  return [];
};


// Get all side effect reports.
export const getSideEffects = async (params = {}) => {
  const response = await api.get("treatment/side_effect/", {
    params,
  });

  return normalizeListResponse(response);
};


// Get one side effect report by ID.
export const getSideEffect = async (id) => {
  const response = await api.get(
    `treatment/side_effect/${id}/`
  );

  return response?.data?.data ?? response?.data;
};


// Create a side effect report.
export const createSideEffect = async (data) => {
  const response = await api.post(
    "treatment/side_effect/",
    data
  );

  return response?.data?.data ?? response?.data;
};


// Update a side effect report.
export const updateSideEffect = async (id, data) => {
  const response = await api.patch(
    `treatment/side_effect/${id}/`,
    data
  );

  return response?.data?.data ?? response?.data;
};


// Delete a side effect report.
export const deleteSideEffect = async (id) => {
  await api.delete(
    `treatment/side_effect/${id}/`
  );
};