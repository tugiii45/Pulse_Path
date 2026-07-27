from django.db import models
from visits.models import Visit
from .prescription import Prescription

class Treatment(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
        ("DISCONTINUED", "Discontinued"),
    ]

    
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name="treatments")

    follow_up_date = models.DateField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Treatment #{self.id} - ({self.status})"


class MediationScheduel(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name="schedules") 
    scheduled_time = models.DateTimeField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        f"{self.prescription.medication.name} - {self.scheduled_time}"    
