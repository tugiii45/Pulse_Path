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

        NOTE: This method is no longer called by any active view.
        DoctorListCreateView is now list-only (see accounts/views/doctor.py),
        and doctor creation happens exclusively through
        AdminCreateDoctorSerializer (accounts/serializers/doctor_provisioning.py).
        Kept here only in case this serializer is reused for a future
        self-service "complete your profile" flow -- if that flow is
        never built, this method can be deleted.
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