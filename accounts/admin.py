"""
Admin configuration for PulsePath accounts.

Registers all models with the Django admin panel and provides
customized list views, field layouts, and search capabilities
for managing users, patients, doctors, hospitals, and departments.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Patient, Doctor, Hospital, Department


# Register models with default admin interface.
# These are simple registrations since they don't need custom admin behavior.
admin.site.register(Patient)
admin.site.register(Doctor)
admin.site.register(Hospital)
admin.site.register(Department)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin configuration for the CustomUser model.

    Extends Django's built-in UserAdmin to provide:
    - A tailored list view showing key user fields.
    - Organized field groupings for editing users.
    - A simplified user creation form.
    - Email-based search functionality.
    """

    model = CustomUser

    # Columns displayed in the user list view in the admin panel.
    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "hospital",
        "is_staff",
        "is_active",
    )

    # Default sort order for the user list (alphabetical by email).
    ordering = ("email",)

    # Field groupings when viewing or editing an existing user.
    # Organizes related fields into logical sections.
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "phone_number")}),
        ("Hospital", {"fields": ("hospital",)}),
        ("Roles", {"fields": ("role",)}),
        (
            "Permissions",
            {
                "fields": (
                    "is_staff",
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )

    # Fields displayed when creating a new user from the admin panel.
    # Uses a wider layout for better readability of the form.
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "first_name",
                    "last_name",
                    "phone_number",
                    "role",
                    "hospital",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )

    # Enable searching for users by their email address in the admin panel.
    search_fields = ("email",)
