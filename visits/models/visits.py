"""
Visit model for PulsePath.

Represents a patient's visit to the hospital or clinic. Each visit
is linked to a patient and may optionally be associated with a
confirmed appointment. Records the reason for the visit, symptoms
observed, initial diagnosis, and doctor's notes.
"""

from django.db import models
from accounts.models import Patient
from .appointment import Appointment


class Visit(models.Model):
    """
    A patient visit record linked to an optional appointment.

    Each visit captures the encounter between a patient and a
    healthcare provider, including symptoms, diagnosis, and notes.
    """

    # Optional link to a confirmed appointment. Using SET_NULL ensures
    # that deleting an appointment does not cascade-delete the visit
    # record, preserving clinical data.
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="visit",
    )

    # The patient who is being seen. This is a required field since
    # every visit must have a patient.
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="visits",
    )

    # Automatically recorded timestamp of when the visit is created.
    visit_date = models.DateTimeField(
        auto_now_add=True,
    )

    # The primary reason provided for the visit (e.g., "chest pain").
    reason = models.TextField()

    # Optional field describing the symptoms the patient is experiencing.
    symptoms = models.TextField(
        blank=True,
        null=True,
    )

    # The doctor's initial diagnosis or assessment notes.
    diagnosis = models.TextField(
        blank=True,
        null=True,
    )

    # Additional clinical notes or observations from the visit.
    notes = models.TextField(
        blank=True,
        null=True,
    )

    # Timestamp set automatically when the visit record is created.
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        """Display the visit by the patient's email."""
        return f"Visit - {self.patient.user.email}"
