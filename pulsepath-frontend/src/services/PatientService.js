import api from "./api";

export const getPatients = async (url = "patients/") => {
  const response = await api.get(url);
  return response.data;
};

export const createPatient = async (data) => {
  const response = await api.post("patients/", data);
  return response.data;
};