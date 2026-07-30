"""
Patient model for PulsePath.

Stores medical and demographic information specific to patients.
Each Patient record is linked one-to-one with a CustomUser account,
so login credentials live in the user model while clinical context
lives here.
"""

from django.db import models
from .user import CustomUser


class Patient(models.Model):
    """Patient profile connected to a user account and their medical journey."""

    # One-to-one with CustomUser ensures that each user can have at most
    # one patient profile. CASCADE ensures that deleting the user also
    # removes the patient profile.
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="patient",
    )

    date_of_birth = models.DateField()

    # Gender is stored as a fixed set of choices to maintain data
    # consistency across the system.
    GENDER_CHOICES = (
        ("MALE", "Male"),
        ("FEMALE", "Female"),
        ("OTHER", "Other"),
    )
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    # Blood group is optional because not all patients may have this
    # information readily available.
    blood_group = models.CharField(max_length=5, blank=True, null=True)

    # Emergency contact number for reaching the patient's next-of-kin
    # or guardian in urgent situations.
    emergency_contact = models.CharField(max_length=20)

    # Physical address of the patient. Stored as a free-text field to
    # accommodate international address formats.
    address = models.CharField(blank=True)

    # Timestamp set automatically when the patient profile is created.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Display the patient by their associated user's email."""
        return str(self.user.email)
