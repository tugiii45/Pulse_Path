import api from "./api";

export const getDoctors = async (url = "doctors/") => {
  const response = await api.get(url);
  return response.data;
};