import api from "./api";

export const getPatients = async (url = "patients/") => {
  const response = await api.get(url);
  return response.data;
};