from django.db import models
from accounts.models import Patient
from .appointment import Appointment

class Visit(models.Model):
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="visit"
        
    )


    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="visits"
    )

    visit_date = models.DateTimeField(
        auto_now_add=True
    )

    reason = models.TextField()

    symptoms = models.TextField(
        blank=True,
        null=True
    )

    diagnosis = models.TextField(
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Visit - {self.patient.user.email}"