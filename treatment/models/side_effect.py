from django.db import models
from accounts.models import *
from treatment.models import *
from treatment.models.prescription import *

class SideEffectReport(models.Model):
    class Severity(models.TextChoices):
        MILD = "Mild", "Mild"
        MODERATE = "Moderate", "Moderate"
        SEVERE = "Severe", "Severe"

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='side_effect_report')
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='side_effect_report')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name='side_effect_report')    
    severity = models.CharField(max_length=10, choices=Severity.choices)
    description = models.TextField()
    is_reviewed = models.BooleanField(default=False)
    doctor_response = models.TextField(blank=True, null=True)
    reported_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} - {self.medication} ({self.severity})"
