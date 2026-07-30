"""
Appointment model for PulsePath.

Represents a scheduled appointment between a patient and a doctor.
Appointments go through a lifecycle: PENDING -> CONFIRMED -> COMPLETED,
or can be CANCELLED at any point before completion.
"""

from django.db import models
from accounts.models import Patient, Doctor


class Appointment(models.Model):
    """
    A scheduled appointment linking a patient, doctor, and date/time.

    Status transitions are validated at the serializer level to ensure
    appointments follow a valid lifecycle (e.g., a completed appointment
    cannot be cancelled).
    """

    # Allowed statuses for an appointment through its lifecycle.
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    ]

    # The patient who booked the appointment.
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="appointments",
    )

    # The doctor who will see the patient.
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="appointments",
    )

    # The scheduled date and time for the appointment.
    # Validated at the serializer level to ensure it is in the future
    # and falls within working hours (8 AM - 5 PM).
    appointment_date = models.DateTimeField()

    # Current status in the appointment lifecycle.
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    # Timestamp set automatically when the appointment is created.
    created_at = models.DateTimeField(auto_now_add=True)

    # Timestamp updated automatically when the appointment is modified.
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Display the appointment by patient and date."""
        return f"{self.patient} - {self.appointment_date}"
    