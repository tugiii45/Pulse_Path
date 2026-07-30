"""
Diagnosis model for PulsePath.

Represents a medical diagnosis made during a patient visit. Each
diagnosis must belong to a visit that has a clinical record. Multiple
diagnoses can be associated with a single visit, but duplicate
conditions are prevented.
"""

from django.core.exceptions import ValidationError
from django.db import models
from visits.models import Visit
from .clinical import ClinicalRecord


class Diagnosis(models.Model):
    """
    A medical diagnosis linked to a patient visit.

    Records the diagnosed condition, its severity, status, and
    the ICD-10 code for standardized medical coding.
    """

    # Severity classification for the diagnosed condition.
    SEVERITY_CHOICES = [
        ("MILD", "Mild"),
        ("MODERATE", "Moderate"),
        ("SEVERE", "Severe"),
    ]

    # Current state of the diagnosed condition.
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("RESOLVED", "Resolved"),
        ("CHRONIC", "Chronic"),
    ]

    # The visit during which this diagnosis was made.
    # One visit can have multiple diagnoses.
    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        related_name="diagnoses",
    )

    # The name of the diagnosed medical condition.
    condition = models.CharField(max_length=255)

    # Standardized ICD-10 code for the condition (optional).
    icd10_code = models.CharField(max_length=10, blank=True)

    # Severity level of the condition.
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)

    # Current status of the condition (active, resolved, or chronic).
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE",
    )

    # Additional notes or context about the diagnosis.
    notes = models.TextField(blank=True)

    # Timestamp set automatically when the diagnosis is recorded.
    diagnosed_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        """
        Validate the diagnosis:
        1. The visit must have a clinical record before adding diagnoses.
        2. No duplicate conditions for the same visit.
        """
        super().clean()
        if self.visit_id and not ClinicalRecord.objects.filter(
            visit=self.visit
        ).exists():
            raise ValidationError(
                {
                    "visit": "Diagnosis must belong to a visit that has a clinical record."
                }
            )

        # Prevent the same condition from being diagnosed twice in one visit.
        if self.visit_id and self.condition:
            duplicate_exists = (
                Diagnosis.objects.filter(
                    visit=self.visit, condition__iexact=self.condition
                )
                .exclude(pk=self.pk)
                .exists()
            )
            if duplicate_exists:
                raise ValidationError(
                    {
                        "condition": "A diagnosis for this condition already exists for this visit."
                    }
                )

    def __str__(self):
        """Display the diagnosis by condition and patient name."""
        return f"{self.condition} - {self.visit.patient.user.get_full_name()}"

    