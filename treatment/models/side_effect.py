from django.core.exceptions import ValidationError
from django.db import models
from accounts.models import *
from treatment.models import *
from treatment.models.prescription import *
from treatment.models.treatment import MedicationSchedule


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

    def clean(self):
        super().clean()
        if self.prescription_id and self.patient_id:
            has_active_schedule = MedicationSchedule.objects.filter(
                prescription=self.prescription,
                prescription__diagnosis__visit__patient=self.patient,
                is_active=True,
            ).exists()
            if not has_active_schedule:
                raise ValidationError({'prescription': 'Side effect reports require an active medication schedule for this patient prescription.'})

    def __str__(self):
        return f"{self.patient} - {self.medication} ({self.severity})"
