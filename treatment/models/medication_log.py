from django.db import models
from .treatment import MedicationSchedule

class MedicationLog (models.Model):
    STATUS_CHOICES = [
        ("TAKEN", "Taken"),
        ("MISSED", "Missed"),
        ("SKIPPED", "Skipped"),
    ]
    medication_schedule = models.ForeignKey(MedicationSchedule, on_delete=models.CASCADE, related_name="logs")
    taken_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.medication_schedule.prescription.medication.name} - {self.status}"