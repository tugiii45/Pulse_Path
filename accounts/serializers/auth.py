"""
Auth serializers for PulsePath.

Handles user registration and profile serialization with password
hashing, hospital selection filtering, and profile display.
"""

from rest_framework import serializers
from ..models import CustomUser, Hospital


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
        )

    def create(self, validated_data):
        """
        Create a new user with properly hashed password.

        Pops the password from validated data to hash it separately
        via set_password(), ensuring it is never stored in plaintext.
        """
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
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
