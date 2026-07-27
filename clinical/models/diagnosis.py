from django.db import models
from visits.models import Visit

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

    def __str__(self):
        return f"{self.condition} - {self.visit.patient.user.get_full_name()}"

    