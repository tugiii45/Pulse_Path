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

    def __str__(self):
        return f"{self.medication.name}Prescription"
    
    