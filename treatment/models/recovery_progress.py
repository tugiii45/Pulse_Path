from django.core.exceptions import ValidationError
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
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.pain_level is None:
            raise ValidationError({'pain_level': 'Pain level is required.'})
        if self.pain_level < 0 or self.pain_level > 10:
            raise ValidationError({'pain_level': 'Pain level must be between 0 and 10'})
        if self.improvement_percentage is None:
            raise ValidationError({'improvement_percentage': 'Improvement percentage is required.'})
        if self.improvement_percentage < 0 or self.improvement_percentage > 100:
            raise ValidationError({'improvement_percentage': 'Recovery improvement percentage must be between 0 and 100'})
        if self.pain_level == 0 and self.improvement_percentage < 100 and self.feeling_better:
            raise ValidationError({'feeling_better': 'Progress is inconsistent with the reported recovery state.'})

    def __str__(self):
        return f"{self.patient} Recovery Progress"
    