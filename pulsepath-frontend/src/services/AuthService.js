import api from "./api";

export const loginUser = async (email, password) => {
  const response = await api.post("login/",  {
    email,
    password,
  });

  return response.data;
};

export const saveTokens = (tokens) => {
  localStorage.setItem("access", tokens.access);
  localStorage.setItem("refresh", tokens.refresh);
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