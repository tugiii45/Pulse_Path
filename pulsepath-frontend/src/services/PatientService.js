import api from "./api";

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

export const getPatients = async (url = "patients/") => {
  const response = await api.get(url);
  return normalizeListResponse(response);
};

export const createPatient = async (data) => {
  const response = await api.post("patients/", data);
  return response.data?.data ?? response.data;
};