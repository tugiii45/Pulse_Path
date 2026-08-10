import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("notifications/");
  return response.data;
};

export const createNotification = async (notificationData) => {
  const response = await api.post(
    "notifications/",
    notificationData
  );

  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(
    `notifications/${notificationId}/`,
    {
      is_read: true,
    }
  );

  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await api.delete(
    `notifications/${notificationId}/`
  );

  return response.data;
};