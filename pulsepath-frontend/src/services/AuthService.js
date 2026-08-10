import api from "./api";

const getAuthPayload = (response) => {
  const payload = response?.data?.data ?? response?.data;
  return payload;
};

export const loginUser = async (email, password) => {
  const response = await api.post("login/", {
    email,
    password,
  });

  return getAuthPayload(response);
};

export const registerUser = async (userData) => {
  const response = await api.post("register/", userData);

  return getAuthPayload(response);
};

export const saveTokens = (tokens) => {
  const access = tokens?.access ?? tokens?.data?.access;
  const refresh = tokens?.refresh ?? tokens?.data?.refresh;

  if (!access || !refresh) {
    throw new Error("Failed to save auth tokens.");
  }

  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
};

export const logoutUser = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

export const getAccessToken = () => {
  return localStorage.getItem("access");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("access");
};

