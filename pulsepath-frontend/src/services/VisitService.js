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

export const getVisits = async () => {
  const response = await api.get("visits/");
  return normalizeListResponse(response);
};

export const getVisit = async (id) => {
  const response = await api.get(`visits/visits/${id}/`);
  return response.data;
};

export const createVisit = async (data) => {
  const response = await api.post("visits/", data);
  return response.data;
};

export const updateVisit = async (id, data) => {
  const response = await api.patch(`visits/visits/${id}/`, data);
  return response.data;
};

export const deleteVisit = async (id) => {
  const response = await api.delete(`visits/visits/${id}/`);
  return response.data;
};