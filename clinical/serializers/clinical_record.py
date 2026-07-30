"""
Clinical Record serializer for PulsePath.

Handles serialization of clinical records linked to patient visits.
Ensures only one clinical record per visit and hospital-scoped
visit selection.
"""

from rest_framework import serializers
from ..models import ClinicalRecord
from visits.models import Visit


class ClinicalRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for ClinicalRecord model.

    - patient_name: Computed read-only field from the visit's patient.
    - visit: Must be unique per clinical record (one record per visit).
    - Visit queryset filtered to the user's hospital.
    """

    patient_name = serializers.CharField(
        source="visit.patient.user.get_full_name",
        read_only=True,
    )
    visit = serializers.PrimaryKeyRelatedField(queryset=Visit.objects.all())

    def __init__(self, *args, **kwargs):
        """
        Filter the visit queryset to only include visits from the
        current user's hospital.
        """
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if (
            request
            and request.user.is_authenticated
            and request.user.hospital_id
        ):
            self.fields["visit"].queryset = Visit.objects.filter(
                patient__user__hospital=request.user.hospital
            )

    class Meta:
        model = ClinicalRecord
        fields = [
            "id",
            "visit",
            "patient_name",
            "allergies",
            "chronic_conditions",
            "current_medications",
            "family_history",
            "medical_notes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "created_at",
            "updated_at",
        ]

    def validate_visit(self, value):
        """
        Ensure a visit is provided and that no clinical record already
        exists for this visit (enforces one-to-one constraint).
        """
        if not value:
            raise serializers.ValidationError("A visit is required.")
        if (
            self.instance is None
            and ClinicalRecord.objects.filter(visit=value).exists()
        ):
            raise serializers.ValidationError(
                "Only one clinical record is allowed per visit."
            )
        return value
        