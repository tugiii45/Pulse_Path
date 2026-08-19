"""
Doctor serializer for PulsePath.

Handles serialization of Doctor profiles including computed fields
from the related CustomUser (full name, email) and department name.
Enforces that doctors can only be assigned to departments within
the user's hospital.
"""

from rest_framework import serializers
from ..models import Doctor, Department
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.contrib.auth import get_user_model
from ..utils.doctor_invite import send_doctor_invitation


class DoctorSerializer(serializers.ModelSerializer):
    """
    Serializer for Doctor model with computed user and department fields.

    - full_name is derived from the related CustomUser's get_full_name().
    - email is sourced from the related CustomUser.
    - department_name is the display name of the department.
    - department FK is filtered to only show departments in the
      user's hospital.
    """

    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Doctor
        fields = [
            "id",
            "user",
            "full_name",
            "email",
            "department",
            "department_name",
            "specialization",
            "license_number",
            "years_of_experience",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "created_at",
            "full_name",
            "email",
            "department_name",
        ]

    def __init__(self, *args, **kwargs):
        """
        Initialize the serializer and filter the department queryset
        to only include departments belonging to the current user's
        hospital. This prevents cross-hospital department assignment.
        """
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if (
            request
            and request.user.is_authenticated
            and request.user.hospital_id
        ):
            self.fields["department"].queryset = Department.objects.filter(
                hospital=request.user.hospital
            )

    def create(self, validated_data):
        """
        Auto-assign the authenticated user as the doctor's user.

        The user is extracted from the request context instead of
        requiring the client to provide a user ID in the POST body.
        """
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def validate_department(self, value):
        """
        Ensure the selected department belongs to the user's hospital.

        If a department is provided, verify its hospital matches the
        current user's hospital to prevent cross-hospital assignments.
        """
        if value is not None:
            request = self.context.get("request")
            if (
                request
                and request.user.hospital_id
                and value.hospital_id != request.user.hospital_id
            ):
                raise ValidationError(
                    "The selected department does not belong to your hospital."
                )
        return value

class AdminCreateDoctorSerializer(serializers.Serializer):
    """
    Serializer used exclusively by administrators to create doctor accounts.

    Creates both the CustomUser account and the associated Doctor profile
    in a single database transaction.
    """

    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    phone_number = serializers.CharField(
        max_length=10,
        required=False,
        allow_blank=True,
    )
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
    )
    specialization = serializers.CharField(max_length=100)
    license_number = serializers.CharField(max_length=100)
    years_of_experience = serializers.IntegerField(
        min_value=0,
    )

    def validate_email(self, value):
        """Prevent creation of duplicate user accounts."""
        User = get_user_model()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email address already exists."
            )

        return value

    def validate_license_number(self, value):
        """Prevent duplicate doctor license numbers."""
        if Doctor.objects.filter(license_number=value).exists():
            raise serializers.ValidationError(
                "A doctor with this license number already exists."
            )

        return value

    def validate_department(self, value):
        """
        Ensure the selected department belongs to a hospital.

        Doctors must always be assigned to both a department and hospital.
        """
        if value.hospital_id is None:
            raise serializers.ValidationError(
                "The selected department is not assigned to a hospital."
            )

        return value

    @transaction.atomic
    def create(self, validated_data):
        """
        Create the doctor user and Doctor profile atomically.

        The password is intentionally not set here. The doctor will receive
        an email invitation and set their own password through the invitation
        flow.
        """
        User = get_user_model()

        department = validated_data.pop("department")
        hospital = department.hospital

        user = User(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            phone_number=validated_data.get("phone_number", ""),
            role=User.Role.DOCTOR,
            hospital=hospital,
            is_active=True,
        )

        user.set_unusable_password()
        user.save()

        doctor = Doctor.objects.create(
            user=user,
            department=department,
            specialization=validated_data["specialization"],
            license_number=validated_data["license_number"],
            years_of_experience=validated_data["years_of_experience"],
        )

        send_doctor_invitation(user)

        return doctor