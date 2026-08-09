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

export const getAppointments = async () => {
  const response = await api.get("visits/appointments/");
  return normalizeListResponse(response);
};

export const getAppointment = async (id) => {
  const response = await api.get(`visits/appointments/${id}/`);
  return response.data?.data ?? response.data;
};

export const createAppointment = async (data) => {
  const response = await api.post("visits/appointments/", data);
  return response.data?.data ?? response.data;
};

export const updateAppointment = async (id, data) => {
  const response = await api.patch(`visits/appointments/${id}/`, data);
  return response.data?.data ?? response.data;
};

export const deleteAppointment = async (id) => {
  await api.delete(`visits/appointments/${id}/`);
};