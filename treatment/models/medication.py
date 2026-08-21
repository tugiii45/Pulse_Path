from django.db import models

class Medication(models.Model):
    name = models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255, blank=True)
    manufacturer = models.CharField(max_length=255, blank=True)
    strength = models.CharField(max_length=250)
    dosage_form = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ({self.strength})"


class HospitalMedication(models.Model):
    """
    Tracks which medications a given hospital stocks/has approved.
    Medication itself stays a shared, global catalog — this table
    is what makes availability hospital-specific.
    """

    hospital = models.ForeignKey(
        "accounts.hospital",  # adjust to your actual app label if different
        on_delete=models.CASCADE,
        related_name="hospital_medications",
    )
    medication = models.ForeignKey(
        Medication,
        on_delete=models.CASCADE,
        related_name="hospital_availability",
    )
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("hospital", "medication")

    def __str__(self):
        return f"{self.medication.name} @ {self.hospital}"