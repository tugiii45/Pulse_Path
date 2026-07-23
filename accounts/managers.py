from django.contrib.auth.base_user import BaseUserManager


# Custom manager for handling user creation.
# It replaces Django's default username-based authentication
# with email-based authentication.
class CustomUserManager(BaseUserManager):

    # Creates and saves a regular user.
    def create_user(self, email, password=None, **extra_fields):

        # Ensure that an email address is provided.
        if not email:
            raise ValueError('Email address required')

        # Normalize the email address (e.g., convert domain to lowercase).
        email = self.normalize_email(email)

        # Create a new user instance with the provided email and any extra fields.
        user = self.model(email=email, **extra_fields)

        # Hash the password before saving it to the database.
        user.set_password(password)

        # Save the user using the current database.
        user.save(using=self._db)

        return user

    # Creates and saves a superuser (administrator).
    def create_superuser(self, email, password=None, **extra_fields):

        # Assign the ADMIN role by default.
        extra_fields.setdefault("role", "ADMIN")

        # Grant staff privileges.
        extra_fields.setdefault('is_staff', True)

        # Grant full superuser permissions.
        extra_fields.setdefault('is_superuser', True)

        # Reuse the create_user() method to create and save the admin user.
        return self.create_user(email, password, **extra_fields)