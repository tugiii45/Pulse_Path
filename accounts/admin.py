from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Patient, Doctor


# Register the Patient model so it can be managed through the Django admin panel.
admin.site.register(Patient)

# Register the Doctor model so it can be managed through the Django admin panel.
admin.site.register(Doctor)



# Register and customize the CustomUser model in the Django admin panel.
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):

    # Specify the model this admin configuration applies to.
    model = CustomUser

    # Define the columns displayed in the admin user list.
    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "is_staff",
        "is_active",
    )

    # Sort users alphabetically by email.
    ordering = ("email",)

    # Organize fields when viewing or editing an existing user.
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "phone_number")}),
        ("Roles", {"fields": ("role",)}),
        ("Permissions", {
            "fields": (
                "is_staff",
                "is_active",
                "is_superuser",
                "groups",
                "user_permissions"
            )
        })
    )

    # Define the fields displayed when creating a new user from the admin panel.
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email",
                "password1",
                "password2",
                "first_name",
                "last_name",
                "phone_number",
                "role",
                "is_staff",
                "is_active",
            ),
        }),
    )

    # Enable searching for users by their email address.
    search_fields = ("email",)