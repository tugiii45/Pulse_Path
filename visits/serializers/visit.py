from rest_framework import serializers
from ..models import Visit
from ..models.appointment import Appointment


class VisitSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.user.get_full_name",
        read_only=True
    )

    appointment = serializers.PrimaryKeyRelatedField(
    queryset=Appointment.objects.all(),
    required=False,
    allow_null=True
)
    class Meta:
        model = Visit
        fields = [
    "id",
    "appointment",
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
    "patient",
    "patient_name",
    "visit_date",
    "created_at",
]
        