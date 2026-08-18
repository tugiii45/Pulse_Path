import api from "./api";

export const getProfile = async () => {
  const response = await api.get("profile/");

  return response?.data?.data ?? response?.data ?? response;
};

export const updateProfile = async (formData) => {
  const response = await api.patch("profile/", formData);

  return response?.data?.data ?? response?.data ?? response;
};