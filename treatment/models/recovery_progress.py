from django.db import models
from accounts.models import *
from visits.models import *

class RecoveryProgress(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='recovery_progress')
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='recovery_progress', blank=True, null=True)
    pain_level = models.PositiveIntegerField(help_text="Pain level on a scale of 0 to 10")
    body_temperature = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    feeling_better = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    improvement_percentage = models.PositiveIntegerField(null=True, blank=True, help_text="Recovery improvement percentage(0-100)")
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} Recovery Progress"
    