from django.core.exceptions import ValidationError
from django.db import models
from clinical.models import Diagnosis
from .medication import Medication


class Prescription(models.Model):
    diagnosis = models.ForeignKey(Diagnosis, on_delete=models.CASCADE, related_name='prescriptions')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name='prescriptions')
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.PositiveIntegerField()
    instructions = models.TextField()
    prescribed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if not self.diagnosis_id:
            raise ValidationError({'diagnosis': 'A diagnosis is required.'})
        if not self.dosage or not str(self.dosage).strip():
            raise ValidationError({'dosage': 'Dosage is required.'})
        if not self.frequency or not str(self.frequency).strip():
            raise ValidationError({'frequency': 'Frequency is required.'})
        if self.duration is None or self.duration <= 0:
            raise ValidationError({'duration': 'Duration must be a positive number of days.'})

    def __str__(self):
        return f"{self.medication.name}Prescription"
    
    