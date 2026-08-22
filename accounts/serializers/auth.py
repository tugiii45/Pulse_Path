"""
Auth serializers for PulsePath.

Handles user registration and profile serialization with password
hashing, hospital selection filtering, and profile display.

Public self-registration is PATIENT-only. DOCTOR accounts are created
exclusively by an ADMIN via AdminCreateDoctorSerializer (see
accounts/serializers/doctor_provisioning.py), which also handles
department/hospital assignment and the invite-email flow. ADMIN
accounts are created by a SUPERADMIN via SuperAdminCreateAdminSerializer
(see accounts/serializers/admin_provisioning.py), not through this
public endpoint.
"""

from rest_framework import serializers
from ..models import CustomUser, Hospital, Patient


class ActiveHospitalField(serializers.PrimaryKeyRelatedField):
    """
    Custom PK field that only allows selecting hospitals that are
    currently active. Prevents users from registering under a
    deactivated hospital.
    """

    def get_queryset(self):
        return Hospital.objects.filter(is_active=True)


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles account registration.

    PATIENT-only: "role" is accepted for backward compatibility with
    existing clients but is forced to "PATIENT" server-side regardless
    of what's submitted, and DOCTOR/ADMIN values are rejected outright
    so this endpoint can't be used to self-provision those roles.
    """

    password = serializers.CharField(write_only=True)
    hospital = ActiveHospitalField(required=False, allow_null=True)
    date_of_birth = serializers.DateField(required=False)
    gender = serializers.ChoiceField(
      choices=Patient.GENDER_CHOICES,
      required=False
)
    blood_group = serializers.CharField(
      required=False,
      allow_blank=True,
      allow_null=True
)
    emergency_contact = serializers.CharField(required=False)
    address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
     model = CustomUser

     fields = (
        "id",
        "email",
        "password",
        "first_name",
        "last_name",
        "phone_number",
        "role",
        "hospital",

        # Patient information
        "date_of_birth",
        "gender",
        "blood_group",
        "emergency_contact",
        "address",
    )

    def validate_role(self, value):
        if value and value != "PATIENT":
            raise serializers.ValidationError(
                "Self-registration is only available for patient accounts. "
                "Doctor accounts are created by an administrator."
            )
        return "PATIENT"

    def create(self, validated_data):
     password = validated_data.pop("password")

     # Force PATIENT regardless of what was submitted -- validate_role
     # already rejects non-patient values, but this is a second,
     # explicit guarantee at the point of creation.
     validated_data["role"] = "PATIENT"

     date_of_birth = validated_data.pop("date_of_birth", None)
     gender = validated_data.pop("gender", None)
     blood_group = validated_data.pop("blood_group", "")
     emergency_contact = validated_data.pop("emergency_contact", "")
     address = validated_data.pop("address", "")

     user = CustomUser(**validated_data)
     user.set_password(password)
     user.save()

     Patient.objects.create(
        user=user,
        date_of_birth=date_of_birth,
        gender=gender,
        blood_group=blood_group,
        emergency_contact=emergency_contact,
        address=address,
    )

     return user


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the authenticated user's profile.

    Users can view their complete profile and update their own
    personal information. Sensitive account-level fields such as
    email, role, hospital, and is_superuser remain read-only.
    """

    hospital_name = serializers.CharField(
        source="hospital.name",
        read_only=True
    )

    profile_picture = serializers.ImageField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = CustomUser

        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "address",
            "profile_picture",
            "role",
            "hospital",
            "hospital_name",
            "is_active",
            "is_superuser",
            "date_joined",
        )

        read_only_fields = (
            "id",
            "email",
            "role",
            "hospital",
            "hospital_name",
            "is_active",
            "is_superuser",
            "date_joined",
        )