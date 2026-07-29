from django.core.exceptions import ValidationError
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


class MedicationSchedule(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name="schedules") 
    scheduled_time = models.DateTimeField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        super().clean()
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValidationError({'end_date': 'End date cannot be earlier than start date.'})

        if self.is_active and self.prescription_id and self.start_date and self.end_date:
            overlapping = MedicationSchedule.objects.filter(
                prescription=self.prescription,
                is_active=True,
            ).exclude(pk=self.pk)
            if overlapping.filter(start_date__lte=self.end_date, end_date__gte=self.start_date).exists():
                raise ValidationError({'prescription': 'This prescription already has an overlapping active medication schedule.'})

    def __str__(self):
        return f"{self.prescription.medication.name} - {self.scheduled_time}"
