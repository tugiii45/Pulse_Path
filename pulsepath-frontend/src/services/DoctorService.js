import api from "./api";

export const getDoctors = async (url = "doctors/") => {
  const response = await api.get(url);
  return response.data;
};

export const createDoctor = async (data) => {
  const response = await api.post("doctors/", data);
  return response.data;
};