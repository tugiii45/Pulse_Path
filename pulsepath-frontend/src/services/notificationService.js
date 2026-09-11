import api from "./api";

/**
 * Normalizes different backend response shapes into a plain array.
 *
 * Different endpoints (or different serializer/pagination configs)
 * can return notifications as:
 *   - a bare array: [...]
 *   - wrapped once: { data: [...] }
 *   - wrapped twice: { data: { data: [...] } }
 *   - paginated: { data: { results: [...] } }
 *
 * This function tries each shape in turn so callers can always treat
 * the result as a plain array, regardless of which shape came back.
 */
const normalizeListResponse = (response) => {
  // Prefer a double-wrapped `data.data`, otherwise fall back to a
  // single `data`.
  const payload = response?.data?.data ?? response?.data;

  // Case 1: already a plain array — nothing more to unwrap.
  if (Array.isArray(payload)) {
    return payload;
  }

  // Case 2: an object that might contain the array under a known key.
  if (payload && typeof payload === "object") {
    // Django REST Framework-style pagination: { results: [...] }
    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    // A `data` key nested one level deeper than expected.
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  // Case 3: nothing matched — return an empty array rather than
  // undefined/null, so callers can safely .map()/.filter() the result
  // without extra null checks.
  return [];
};


/**
 * Fetches the current user's notifications (list endpoint).
 * Response shape is normalized to a plain array via
 * normalizeListResponse, regardless of pagination/wrapping.
 */
export const getNotifications = async () => {
  const response = await api.get("notifications/");

  return normalizeListResponse(response);
};


/**
 * Creates a new notification.
 *
 * Note: on the backend (NotificationListCreateView), `created_by` is
 * set automatically from the authenticated user — it doesn't need to
 * be included in notificationData.
 */
export const createNotification = async (notificationData) => {
  const response = await api.post(
    "notifications/",
    notificationData
  );

  return response?.data?.data ?? response?.data;
};


/**
 * Marks a single notification as read.
 *
 * Sends a PATCH with only { is_read: true } — the backend's
 * perform_update() enforces that patients can ONLY change this field,
 * so sending anything else here would be rejected server-side.
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(
    `notifications/${notificationId}/`,
    {
      is_read: true,
    }
  );

  return response?.data?.data ?? response?.data;
};


/**
 * Deletes a notification by ID.
 * Backend permission (IsNotificationRecipientOrStaff) ensures a user
 * can only delete notifications where they are the recipient (or are
 * staff/admin acting within their scope).
 */
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(
    `notifications/${notificationId}/`
  );

  return response?.data?.data ?? response?.data;
};