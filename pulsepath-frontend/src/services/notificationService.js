import api from "./api";

/**
 * Fetches notifications available to the authenticated user.
 */
export const getNotifications = async () => {
  const response = await api.get("notifications/");

  return response.data;
};

/**
 * Creates a new notification.
 *
 * @param {Object} notificationData - Notification information.
 */
export const createNotification = async (notificationData) => {
  const response = await api.post(
    "notifications/",
    notificationData
  );

  return response.data;
};

/**
 * Marks a notification as read.
 *
 * Sends a PATCH request to update only the
 * `is_read` field of the notification.
 *
 * @param {string|number} notificationId - Notification ID.
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(
    `notifications/${notificationId}/`,
    {
      is_read: true,
    }
  );

  return response.data;
};

/**
 * Deletes a notification by its ID.
 *
 * @param {string|number} notificationId - Notification ID.
 */
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(
    `notifications/${notificationId}/`
  );

  return response.data;
};