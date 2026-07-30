from django.db import models


class Department(models.Model):
    hospital = models.ForeignKey(
    "Hospital",
    on_delete=models.CASCADE,
    related_name="departments",
    null=True,
    blank=True
)

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("hospital", "name")

    def __str__(self):
       if self.hospital:
           return f"{self.name} - {self.hospital.name}"
       return self.name