"""
Clinical Record model for PulsePath.

Stores comprehensive medical history and notes for a patient visit.
Each visit can have at most one clinical record (OneToOneField).
Includes allergies, chronic conditions, current medications, family
history, and medical notes.
"""

from django.core.exceptions import ValidationError
from django.db import models
from visits.models import Visit


class ClinicalRecord(models.Model):
    """
    A comprehensive clinical record linked one-to-one with a visit.

    Captures the patient's medical background including allergies,
    chronic conditions, medications, family history, and the
    healthcare provider's notes.
    """

    # One-to-one with Visit ensures only one clinical record per visit.
    # CASCADE ensures the clinical record is deleted with the visit.
    visit = models.OneToOneField(
        Visit,
        on_delete=models.CASCADE,
        related_name="clinical_record",
    )

    # Known allergies of the patient (e.g., drug allergies).
    allergies = models.TextField(blank=True)

    # Pre-existing long-term medical conditions.
    chronic_conditions = models.TextField(blank=True)

    # Medications the patient is currently taking.
    current_medications = models.TextField(blank=True)

    # Relevant medical history of the patient's family.
    family_history = models.TextField(blank=True)

    # The healthcare provider's clinical observations and notes.
    medical_notes = models.TextField(blank=True)

    # Timestamp set automatically when the record is created.
    created_at = models.DateTimeField(auto_now_add=True)

    # Timestamp updated automatically when the record is modified.
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        """Validate that a visit is associated with the clinical record."""
        super().clean()
        if not self.visit_id:
            raise ValidationError({"visit": "A visit is required."})

    def __str__(self):
        """Display the clinical record by the patient's full name."""
        return f"Clinical Record - {self.visit.patient.user.get_full_name()}"

    