from django.core.exceptions import ValidationError
from django.db import models
from visits.models import Visit


class ClinicalRecord(models.Model):
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name="clinical_record")

    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)
    current_medications = models.TextField(blank=True)
    family_history = models.TextField(blank=True)
    medical_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if not self.visit_id:
            raise ValidationError({'visit': 'A visit is required.'})

    def __str__(self):
        return f"Clinical Record - {self.visit.patient.user.get_full_name()}"

    