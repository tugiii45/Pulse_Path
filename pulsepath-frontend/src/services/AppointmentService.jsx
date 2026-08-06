import api from "./api";

export const getAppointments = async () => {
    const response = await api.get("visits/appointments/");
    return response.data.data;
};

export const getAppointment = async (id) => {
  const response = await api.get(`visits/appointments/${id}/`);
  return response.data;
};

export const createAppointment = async (data) => {
  const response = await api.post("visits/appointments/", data);
  return response.data;
};

export const updateAppointment = async (id, data) => {
  const response = await api.patch(`visits/appointments/${id}/`, data);
  return response.data;
};

export const deleteAppointment = async (id) => {
  await api.delete(`visits/appointments/${id}/`);
};