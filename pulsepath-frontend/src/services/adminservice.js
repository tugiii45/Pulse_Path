import api from "./api";

export const createAdmin = async (formData) => {
  const response = await api.post("admins/create/", formData);

  return response?.data?.data ?? response?.data ?? response;
};