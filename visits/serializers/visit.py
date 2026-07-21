from rest_framework import serializers
from ..models import Visit


class VisitSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.user.get_full_name",
        read_only=True
    )

    class Meta:
        model = Visit
        fields = [
            "id",
            "patient",
            "patient_name",
            "visit_date",
            "reason",
            "symptoms",
            "diagnosis",
            "notes",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "visit_date",
            "created_at",
        ]