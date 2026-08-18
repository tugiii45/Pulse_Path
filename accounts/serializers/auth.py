"""
Auth serializers for PulsePath.

Handles user registration and profile serialization with password
hashing, hospital selection filtering, and profile display.
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

    - Accepts user details including email, password, and role.
    - Hashes the password before storing it in the database.
    - Allows selecting an active hospital (optional for patients
      who may not be assigned to a hospital yet).
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
    def create(self, validated_data):
     password = validated_data.pop("password")

     date_of_birth = validated_data.pop("date_of_birth", None)
     gender = validated_data.pop("gender", None)
     blood_group = validated_data.pop("blood_group", "")
     emergency_contact = validated_data.pop("emergency_contact", "")
     address = validated_data.pop("address", "")

     user = CustomUser(**validated_data)
     user.set_password(password)
     user.save()

     if user.role == "PATIENT":
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
    Returns the authenticated user's profile information.

    Includes the hospital name as a computed field for convenient
    display on the frontend without requiring an extra API call.
    """

    hospital_name = serializers.CharField(source="hospital.name", read_only=True)

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "hospital",
            "hospital_name",
            "is_active",
            "date_joined",
        )
        read_only_fields = fields
