"""
Hospital model for PulsePath.

Represents a healthcare organization (e.g., a hospital or clinic) that
owns departments, employs doctors, and serves patients. All data in the
system is scoped to a hospital for multi-tenant isolation.
"""

from django.db import models


class Hospital(models.Model):
    """Represents a healthcare organization that owns departments and users."""

    # Hospital name must be unique across the entire platform to avoid
    # confusion between different institutions.
    name = models.CharField(max_length=200, unique=True)

    # Official contact email for the hospital.
    email = models.EmailField(unique=True)

    # Contact phone number for the hospital's front desk.
    phone = models.CharField(max_length=20)

    # Physical location of the hospital. Stored as free text to
    # accommodate various address formats globally.
    address = models.TextField()

    # Soft-delete and visibility flag. Inactive hospitals are hidden
    # from selection during registration but their historical data
    # remains in the system.
    is_active = models.BooleanField(default=True)

    # Timestamp set automatically when the hospital is created.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Display the hospital by its name."""
        return self.name
