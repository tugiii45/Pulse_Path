import { useEffect, useState } from "react";
import {
  FaBell,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaHeartbeat,
  FaPills,
  FaRedo,
  FaTrash,
} from "react-icons/fa";

import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications();

      console.log("NOTIFICATIONS API RESPONSE:", data);

      setNotifications(data.results || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError("Failed to update notification.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setError("Failed to delete notification.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.is_read
      );

      await Promise.all(
        unreadNotifications.map((notification) =>
          markNotificationAsRead(notification.id)
        )
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setError("Failed to mark all notifications as read.");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "MEDICATION":
        return <FaPills />;

      case "APPOINTMENT":
        return <FaCalendarAlt />;

      case "FOLLOW_UP":
        return <FaHeartbeat />;

      case "MISSED_DOSE":
        return <FaExclamationCircle />;

      case "GENERAL":
      default:
        return <FaBell />;
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case "MEDICATION":
        return "text-primary bg-primary-subtle";

      case "APPOINTMENT":
        return "text-success bg-success-subtle";

      case "FOLLOW_UP":
        return "text-warning bg-warning-subtle";

      case "MISSED_DOSE":
        return "text-danger bg-danger-subtle";

      case "GENERAL":
      default:
        return "text-secondary bg-secondary-subtle";
    }
  };

  const formatNotificationType = (type) => {
    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-1">
              Notifications
            </h2>

            {unreadCount > 0 && (
              <span className="badge bg-primary rounded-pill">
                {unreadCount} new
              </span>
            )}
          </div>

          <p className="text-muted mb-0">
            Stay updated with your medications, appointments,
            follow-ups and recovery.
          </p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">

          <button
            className="btn btn-outline-secondary"
            onClick={loadNotifications}
          >
            <FaRedo className="me-2" />
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              className="btn btn-primary"
              onClick={handleMarkAllAsRead}
            >
              <FaCheckCircle className="me-2" />
              Mark all as read
            </button>
          )}

        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center"
          role="alert"
        >
          <span>{error}</span>

          <button
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">

            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "80px",
                height: "80px",
                fontSize: "30px",
              }}
            >
              <FaBell />
            </div>

            <h4 className="fw-bold">
              You're all caught up!
            </h4>

            <p className="text-muted mb-0">
              You don't have any notifications right now.
            </p>

          </div>
        </div>
      ) : (

        <div className="row g-4">

          {/* Main notifications */}
          <div className="col-lg-8">

            <div className="card border-0 shadow-sm">

              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="fw-bold mb-1">
                  Recent notifications
                </h5>

                <p className="text-muted small mb-0">
                  Your latest PulsePath updates
                </p>
              </div>

              <div className="card-body px-4">

                {notifications.map((notification) => (

                  <div
                    key={notification.id}
                    className={`p-3 mb-3 rounded-4 border ${
                      notification.is_read
                        ? "bg-white"
                        : "bg-light border-primary-subtle"
                    }`}
                  >

                    <div className="d-flex gap-3">

                      {/* Icon */}
                      <div
                        className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${getNotificationClass(
                          notification.notification_type
                        )}`}
                        style={{
                          width: "52px",
                          height: "52px",
                          fontSize: "20px",
                        }}
                      >
                        {getNotificationIcon(
                          notification.notification_type
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-grow-1">

                        <div className="d-flex flex-wrap justify-content-between gap-2">

                          <div className="d-flex align-items-center gap-2">

                            <h6 className="fw-bold mb-0">
                              {notification.title}
                            </h6>

                            {!notification.is_read && (
                              <span className="badge bg-primary rounded-pill">
                                New
                              </span>
                            )}

                          </div>

                          <span
                            className={`badge ${getNotificationClass(
                              notification.notification_type
                            )}`}
                          >
                            {formatNotificationType(
                              notification.notification_type
                            )}
                          </span>

                        </div>

                        <p className="text-muted mt-2 mb-2">
                          {notification.message}
                        </p>

                        <div className="d-flex flex-wrap justify-content-between align-items-center">

                          <small className="text-muted">
                            <FaClock className="me-1" />
                            {formatDate(notification.created_at)}
                          </small>

                          <div className="d-flex gap-2 mt-2 mt-sm-0">

                            {!notification.is_read && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  handleMarkAsRead(
                                    notification.id
                                  )
                                }
                              >
                                <FaCheckCircle className="me-1" />
                                Mark as read
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(notification.id)
                              }
                            >
                              <FaTrash />
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>
            </div>

          </div>

          {/* Notification summary */}
          <div className="col-lg-4">

            <div className="card border-0 shadow-sm mb-4">

              <div className="card-body p-4">

                <div className="d-flex align-items-center gap-3 mb-4">

                  <div
                    className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                    style={{
                      width: "52px",
                      height: "52px",
                    }}
                  >
                    <FaBell />
                  </div>

                  <div>
                    <h5 className="fw-bold mb-0">
                      Notification center
                    </h5>

                    <small className="text-muted">
                      PulsePath updates
                    </small>
                  </div>

                </div>

                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">
                    Total
                  </span>

                  <strong>
                    {notifications.length}
                  </strong>
                </div>

                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">
                    Unread
                  </span>

                  <strong className="text-primary">
                    {unreadCount}
                  </strong>
                </div>

                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">
                    Read
                  </span>

                  <strong>
                    {notifications.length - unreadCount}
                  </strong>
                </div>

              </div>

            </div>

            {/* Reminder card */}
            <div className="card border-0 shadow-sm">

              <div className="card-body p-4">

                <div className="d-flex align-items-center gap-3 mb-3">

                  <div
                    className="rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <FaHeartbeat />
                  </div>

                  <div>
                    <h6 className="fw-bold mb-0">
                      Stay on track
                    </h6>

                    <small className="text-muted">
                      Your recovery journey
                    </small>
                  </div>

                </div>

                <p className="text-muted small mb-0">
                  Keep an eye on your notifications for
                  medication reminders, appointments and
                  recovery updates.
                </p>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Notifications;