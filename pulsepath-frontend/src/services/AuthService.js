import api from "./api";

/**
 * Extracts the authentication payload from the API response.
 *
 * The backend may return authentication data directly
 * or wrapped inside a `data` property.
 *
 * This keeps the rest of the application independent
 * of the exact response structure.
 */
const getAuthPayload = (response) => {
  const payload = response?.data?.data ?? response?.data;

  return payload;
};

/**
 * Authenticates a user using their email and password.
 *
 * Sends the credentials to the backend login endpoint
 * and returns the authentication payload, including
 * the JWT access and refresh tokens.
 */
export const loginUser = async (email, password) => {
  const response = await api.post("login/", {
    email,
    password,
  });

  return getAuthPayload(response);
};

/**
 * Registers a new user account.
 *
 * @param {Object} userData - User registration information.
 */
export const registerUser = async (userData) => {
  const response = await api.post("register/", userData);

  return getAuthPayload(response);
};

/**
 * Sets the password for a newly invited account (e.g. a doctor
 * account created by an admin) using the uidb64/token pair from
 * the invite email link, activating the account for login.
 *
 * @param {Object} params
 * @param {string} params.uidb64 - Base64-encoded user id from the invite link.
 * @param {string} params.token - Invite/activation token from the invite link.
 * @param {string} params.password - The new password to set.
 */
export const setPassword = async ({ uidb64, token, password }) => {
  const response = await api.post("set-password/", {
    uidb64,
    token,
    password,
  });

  return getAuthPayload(response);
};

/**
 * Saves the JWT authentication tokens in localStorage.
 *
 * The access token is used to authenticate API requests,
 * while the refresh token is used to obtain a new access
 * token when the current one expires.
 */
export const saveTokens = (tokens) => {
  const access = tokens?.access ?? tokens?.data?.access;
  const refresh = tokens?.refresh ?? tokens?.data?.refresh;

  // Make sure both required tokens were returned.
  if (!access || !refresh) {
    throw new Error("Failed to save auth tokens.");
  }

  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
};

/**
 * Logs the user out by removing the stored
 * authentication tokens from localStorage.
 */
export const logoutUser = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

/**
 * Stores a temporary authentication-related message.
 *
 * sessionStorage is used so the message remains available
 * during the current browser session but is cleared when
 * the session ends.
 *
 * @param {string} message - Message to store.
 */
export const setAuthMessage = (message) => {
  if (message) {
    sessionStorage.setItem("auth_message", message);
    return;
  }

  sessionStorage.removeItem("auth_message");
};

/**
 * Retrieves the currently stored authentication message.
 */
export const getAuthMessage = () => {
  return sessionStorage.getItem("auth_message") || "";
};

/**
 * Removes the stored authentication message.
 */
export const clearAuthMessage = () => {
  sessionStorage.removeItem("auth_message");
};

/**
 * Retrieves the JWT access token from localStorage.
 *
 * This token is typically attached to authenticated
 * API requests by the Axios configuration.
 */
export const getAccessToken = () => {
  return localStorage.getItem("access");
};

/**
 * Checks whether an access token currently exists.
 *
 * Returns true when the user has an access token
 * and false when they do not.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("access");
};