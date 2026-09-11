import api from "./api";

/**
 * Fetches the authenticated user's profile.
 *
 * The `?? ` chain below unwraps the response regardless of whether the
 * backend replies with { data: { data: {...} } }, { data: {...} }, or
 * (unexpectedly) something without a `data` key at all — falling back
 * to the raw response as a last resort so this never returns undefined.
 */
export const getProfile = async () => {
  const response = await api.get("profile/");

  return response?.data?.data ?? response?.data ?? response;
};

/**
 * Updates the authenticated user's profile.
 *
 * Accepts a FormData instance (rather than a plain object) — this
 * suggests the profile can include a file upload (e.g. a profile
 * picture), since FormData is typically used specifically to send
 * multipart/form-data requests. PATCH means only the fields present
 * in formData are changed; anything not included is left as-is.
 *
 * Same response-unwrapping logic as getProfile above.
 */
export const updateProfile = async (formData) => {
  const response = await api.patch("profile/", formData);

  return response?.data?.data ?? response?.data ?? response;
};