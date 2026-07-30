"""
Department model for PulsePath.

Represents a functional unit within a hospital, such as cardiology,
pediatrics, or orthopedics. Each department belongs to a single
hospital, and the combination of hospital + name is unique.
"""

from django.db import models


class Department(models.Model):
    """A department within a hospital, such as cardiology or pediatrics."""

    # Foreign key to the hospital that owns this department.
    # CASCADE ensures that deleting a hospital removes its departments.
    # This field can be null to support departments that are being
    # set up before being assigned to a hospital.
    hospital = models.ForeignKey(
        "Hospital",
        on_delete=models.CASCADE,
        related_name="departments",
        null=True,
        blank=True,
    )

    # Display name of the department (e.g., "Cardiology").
    name = models.CharField(max_length=100)

    # Free-text description of the department's scope and services.
    description = models.TextField(blank=True)

    # Timestamp set automatically when the department is created.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent two departments with the same name in one hospital.
        unique_together = ("hospital", "name")

    def __str__(self):
        """Display the department name along with its hospital."""
        if self.hospital:
            return f"{self.name} - {self.hospital.name}"
        return self.name
