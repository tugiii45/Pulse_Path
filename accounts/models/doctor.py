"""
Doctor model for PulsePath.

Links a medical professional to their user account and department.
Each doctor record stores professional credentials such as license
number, specialization, and years of experience.
"""

from django.db import models
from .user import CustomUser
from .department import Department


class Doctor(models.Model):
    """Doctor profile linked to a user account and hospital department."""

    # One-to-one relationship with CustomUser ensures each doctor has
    # exactly one user account for authentication.
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="doctor",
    )

    # Each doctor belongs to a department (e.g., Cardiology, Pediatrics).
    # SET_NULL ensures that deleting a department does not delete the
    # doctor records — the department field simply becomes null.
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="doctors",
    )

    # The doctor's area of expertise, e.g., "Cardiology" or "Neurology".
    specialization = models.CharField(max_length=100)

    # Government-issued medical license number. Enforced as unique to
    # prevent duplicate registrations of the same professional.
    license_number = models.CharField(max_length=100, unique=True)

    # Number of years the doctor has been practicing medicine.
    # Used for filtering and display purposes.
    years_of_experience = models.PositiveIntegerField(default=0)

    # Timestamp set automatically when the doctor profile is created.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Display the doctor by their associated user representation."""
        return str(self.user)
        