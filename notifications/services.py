from .models import Notification


def create_notification(
    *,
    recipient,
    title,
    message,
    notification_type,
    notification_key,
    created_by=None,
):
    """
    Centralized helper for creating PulsePath notifications.

    Prevents duplicate notifications by using notification_key.
    """

    notification, created = Notification.objects.get_or_create(
        notification_key=notification_key,
        defaults={
            "recipient": recipient,
            "created_by": created_by,
            "title": title,
            "message": message,
            "notification_type": notification_type,
        },
    )

    return notification, created