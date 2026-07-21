from django.db import models
from visits.models import Visit

class Treatment(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
        ("DISCONTINUED", "Discontinued"),
    ]

    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name="treatments")

    medication = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    instructions = models.TextField()
    follow_up_date = models.DateField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medication} ({self.status})"
