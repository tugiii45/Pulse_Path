from django.db import models
from .user import CustomUser

class Patient(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='patient_profile')

    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    emergency_contact = models.CharField(max_length=20)
    address = models.CharField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return
        self.user.get_full_name() or self.user.email