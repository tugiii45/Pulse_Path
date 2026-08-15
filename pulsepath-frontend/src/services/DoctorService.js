import api from "./api";

// Normalize different API response formats into a simple array.
const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  // API directly returns an array.
  if (Array.isArray(payload)) {
    return payload;
  }

  // API returns an object containing results/data.
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

// Get doctors and always return an array.
export const getDoctors = async (url = "doctors/") => {
  const response = await api.get(url);

  return normalizeListResponse(response);
};

// Create a doctor.
export const createDoctor = async (data) => {
  const response = await api.post("doctors/", data);

  return response.data?.data ?? response.data;
};