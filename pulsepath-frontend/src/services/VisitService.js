import api from "./api";

export const getVisits = async () => {
  const response = await api.get("visits/");
  return response.data;
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