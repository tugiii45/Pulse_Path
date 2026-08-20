import axios from "axios";

const setAuthMessage = (message) => {
  if (message) {
    sessionStorage.setItem("auth_message", message);
    return;
  }

  sessionStorage.removeItem("auth_message");
};

// Falls back to 127.0.0.1 for local-only development. Set
// VITE_API_BASE_URL in your .env (e.g. http://192.168.1.66:8000/api/)
// when you need the backend reachable from another device, like a
// phone on the same network.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: on 401 try to refresh the access token once and retry the original request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          // Use plain axios to avoid interceptor loops
          const res = await axios.post(`${API_BASE_URL}token/refresh/`, {
            refresh,
          });

          const newAccess = res?.data?.access || res?.data?.data?.access;
          if (newAccess) {
            localStorage.setItem("access", newAccess);
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
            originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // fall through to logout below
        }
      }

      // If we reach here, refresh failed or was not available — clear tokens and redirect to login
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setAuthMessage("Your session expired. Please log in again.");
      try {
        window.location.href = "/login";
      } catch (e) {}
    }

    return Promise.reject(error);
  }
);

export default api;