from django.core.exceptions import ValidationError
from django.db import models
from visits.models import Visit
from .clinical import ClinicalRecord


class Diagnosis(models.Model):
    SEVERITY_CHOICES = [
        ('MILD', 'Mild'),
        ('MODERATE', 'Moderate'),
        ('SEVERE', 'Severe'),
        
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('RESOLVED', 'Resolved'),
        ('CHRONIC', 'Chronic'),
    ]

    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='diagnoses')
    condition = models.CharField(max_length=255)
    icd10_code = models.CharField(max_length=10, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    notes = models.TextField(blank=True)
    diagnosed_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        super().clean()
        if self.visit_id and not ClinicalRecord.objects.filter(visit=self.visit).exists():
            raise ValidationError({'visit': 'Diagnosis must belong to a visit that has a clinical record.'})

        if self.visit_id and self.condition:
            duplicate_exists = Diagnosis.objects.filter(visit=self.visit, condition__iexact=self.condition).exclude(pk=self.pk).exists()
            if duplicate_exists:
                raise ValidationError({'condition': 'A diagnosis for this condition already exists for this visit.'})

    def __str__(self):
        return f"{self.condition} - {self.visit.patient.user.get_full_name()}"

    