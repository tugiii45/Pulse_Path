"""
Custom user manager for PulsePath.

Replaces Django's default BaseUserManager to support email-based
authentication instead of username-based authentication. This is
essential for the healthcare context where email is the primary
identifier for users.
"""

from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
    """
    Custom manager for creating users and superusers.

    This manager overrides Django's default UserManager to:
    - Require email instead of username for authentication.
    - Automatically assign the ADMIN role to superusers.
    - Normalize email addresses before saving.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.

        Args:
            email: The user's email address (used as the login identifier).
            password: The user's password (will be hashed before storage).
            **extra_fields: Any additional fields to set on the user model.

        Returns:
            The created CustomUser instance.

        Raises:
            ValueError: If no email address is provided.
        """
        if not email:
            raise ValueError("Email address required")

        # Normalize the email domain to lowercase (e.g., "User@Example.com"
        # becomes "user@example.com") to ensure consistent lookups.
        email = self.normalize_email(email)

        # Create the user instance with the normalized email.
        user = self.model(email=email, **extra_fields)

        # Hash the password using Django's built-in password hasher.
        # Never store passwords in plaintext.
        user.set_password(password)

        # Save the user to the database using the configured database.
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser (platform administrator).

        Automatically assigns the ADMIN role, staff status, and
        superuser permissions. This is used by the `createsuperuser`
        management command.

        Args:
            email: The superuser's email address.
            password: The superuser's password.
            **extra_fields: Any additional fields to set.

        Returns:
            The created CustomUser instance with superuser privileges.
        """
        # Default to the ADMIN role since superusers are platform admins.
        extra_fields.setdefault("role", "ADMIN")

        # Grant staff privileges so the user can access the admin panel.
        extra_fields.setdefault("is_staff", True)

        # Grant all permissions without explicitly assigning them.
        extra_fields.setdefault("is_superuser", True)

        # Reuse the create_user logic to handle email normalization
        # and password hashing.
        return self.create_user(email, password, **extra_fields)
