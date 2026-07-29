from django.db import models
from accounts.models import *
from django.conf import settings


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        MEDICATION = "MEDICATION", "Medication Reminder"
        APPOINTMENT = "APPOINTMENT", "Appointment Reminder"
        FOLLOW_UP = "FOLLOW_UP", "Follow-up Reminder"
        MISSED_DOSE = "MISSED_DOSE", "Missed Dose Alert"
        GENERAL = "GENERAL", "General Notification"

    recepient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_notifications') 
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sent_notifications') 
    title = models.CharField(max_length=240)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices, default=NotificationType.GENERAL)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f"{self.title} - {self.user.email}"

    