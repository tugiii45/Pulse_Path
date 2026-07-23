from django.db import models
from accounts.models import Patient, Doctor

class Appointment(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
        
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments",)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments",)
    appointment_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING",)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient} - {self.appointment_date}"
    