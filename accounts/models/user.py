"""
Custom user model for PulsePath.

This module defines the CustomUser model which serves as the primary
authentication model for the entire platform. Instead of using Django's
default username-based authentication, this system uses email-based
authentication, which is more practical for healthcare applications
where email is a primary communication channel.
"""

from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from ..managers import CustomUserManager


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom authentication model for admins, doctors, and patients.

    Replaces Django's default User model to support:
    - Email-based login instead of username
    - Role-based access control (Admin, Doctor, Patient)
    - Hospital-level data scoping via the hospital FK
    - UUID primary keys for security (non-sequential IDs)
    """

    class Role(models.TextChoices):
        """
        Enumeration of allowed user roles on the platform.

        ADMIN   - Hospital administrator with management privileges.
        DOCTOR  - Medical professional who can create and review records.
        PATIENT - Individual receiving care, with access only to
                  their own data.
        """
        ADMIN = "ADMIN", "Admin"
        DOCTOR = "DOCTOR", "Doctor"
        PATIENT = "PATIENT", "Patient"

    # Use UUID as the primary key instead of auto-incrementing integers.
    # This prevents attackers from guessing user IDs and makes the
    # system more resilient to enumeration attacks.
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    # Email serves as the unique identifier and login credential for
    # every user in the system. It is enforced as unique at the
    # database level to prevent duplicate accounts.
    email = models.EmailField(
        unique=True,
    )

    first_name = models.CharField(
        max_length=50,
    )

    last_name = models.CharField(
        max_length=50,
    )

    # Optional phone number for emergency contact or appointment
    # reminders. Limited to 10 characters to accommodate standard
    # phone number formats.
    phone_number = models.CharField(
        max_length=10,
        blank=True,
    )

    # Determines what the user can see and do within the platform.
    # Permissions are enforced globally via the accounts.permissions
    # module.
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PATIENT,
    )

    # Links the user to a specific hospital. This is the foundation of
    # the multi-tenant data isolation strategy: every record in the
    # system can be traced back to a hospital through its relationships,
    # and the HospitalQuerySetMixin uses this to filter data per request.
    # SET_NULL ensures that deleting a hospital does not cascade-delete
    # all its users.
    hospital = models.ForeignKey(
        "Hospital",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )

    # Grants access to the Django admin panel. Only superusers or
    # staff users can access /admin/.
    is_staff = models.BooleanField(
        default=False,
    )

    # Soft-delete flag. When a user is deactivated, their data is
    # preserved in the system but they can no longer log in.
    is_active = models.BooleanField(
        default=True,
    )

    # Automatically set when the user account is first created.
    date_joined = models.DateTimeField(
        auto_now_add=True,
    )

    address = models.CharField(
      max_length=255,
      blank=True,
)

    profile_picture = models.ImageField(
      upload_to="profile_pictures/",
      blank=True,
      null=True,
)

    # Use the custom manager that supports email-based user creation
    # instead of Django's default username-based manager.
    objects = CustomUserManager()

    # Email is used as the unique identifier for authentication.
    USERNAME_FIELD = "email"

    # These fields are required when creating a superuser via
    # the `createsuperuser` management command.
    REQUIRED_FIELDS = ["first_name", "last_name", "role"]

    def get_full_name(self):
        """Return the user's full name by combining first and last name."""
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        """Return the email as the human-readable representation."""
        return self.email

    
        

    
        
