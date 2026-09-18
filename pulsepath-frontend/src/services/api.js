import axios from "axios";

const setAuthMessage = (message) => {
  if (message) {
    sessionStorage.setItem("auth_message", message);
    return;
  }

  sessionStorage.removeItem("auth_message");
};

// Set VITE_API_URL to the Django server origin, for example:
// https://your-backend.onrender.com
// The API routes are mounted under /api/ in Django.
const configuredApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://127.0.0.1:8000"
    : "https://pulse-path-app.onrender.com");
export const API_BASE_URL = `${configuredApiUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/, "")}/api/`;

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