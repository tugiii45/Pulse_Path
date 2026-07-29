from django.db import models
from .user import CustomUser
from .department import Department

class Doctor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor',)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors')
    specialization = models.CharField(max_length=100)
    license_number = models.CharField(max_length=100, unique=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.user)
        