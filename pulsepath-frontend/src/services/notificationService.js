import api from "./api";

const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  return [];
};


export const getNotifications = async () => {
  const response = await api.get("notifications/");

  return normalizeListResponse(response);
};


export const createNotification = async (notificationData) => {
  const response = await api.post(
    "notifications/",
    notificationData
  );

  return response?.data?.data ?? response?.data;
};


export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(
    `notifications/${notificationId}/`,
    {
      is_read: true,
    }
  );

  return response?.data?.data ?? response?.data;
};


export const deleteNotification = async (notificationId) => {
  const response = await api.delete(
    `notifications/${notificationId}/`
  );

  return response?.data?.data ?? response?.data;
};