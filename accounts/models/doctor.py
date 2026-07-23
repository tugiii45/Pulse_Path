from django.db import models
from .user import CustomUser

class Doctor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor',)
    specialization = models.CharField(max_length=100)
    license_number = models.CharField(max_length=100, unique=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.user)
        