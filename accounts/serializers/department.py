"""
Department serializer for PulsePath.

Handles serialization of hospital departments with automatic
assignment of the department to the creating user's hospital.
"""

from rest_framework import serializers
from ..models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Department model.

    - hospital_name is a read-only computed field for display.
    - On creation, automatically assigns the department to the
      authenticated user's hospital.
    """

    hospital_name = serializers.CharField(source="hospital.name", read_only=True)

    class Meta:
        model = Department
        fields = [
            "id",
            "name",
            "description",
            "hospital",
            "hospital_name",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "hospital_name"]

    def create(self, validated_data):
        """
        Create a department and automatically assign it to the
        current user's hospital if the user has one.

        This prevents the need for the client to explicitly pass
        the hospital ID in the request body.
        """
        request = self.context.get("request")
        if request and request.user.hospital_id:
            validated_data["hospital"] = request.user.hospital
        return super().create(validated_data)
