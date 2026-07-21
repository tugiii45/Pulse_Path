from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Patient

admin.site.register(Patient)
# Register your models here.

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):

    model = CustomUser
    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "is_staff",
        "is_active",
    )

    ordering = ("email",)
    fieldsets = (
        (None, {"fields" : ("email", "password")}),
        ("Personal info", {"fields" : ("first_name", "last_name", "phone_number")}),
        ("Roles", {"fields" : ("role",)}),
        ("Permissions", {"fields" : ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")})
    )

    add_fieldsets = (
        (None, {
            "classes":("wide",),
            "fields":(
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

    search_fields = ("email",)
    