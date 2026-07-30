"""
Diagnosis serializer for PulsePath.

Handles serialization of medical diagnoses linked to patient visits.
Enforces that diagnoses can only be created for visits that have a
clinical record, and prevents duplicate conditions per visit.
"""

from rest_framework import serializers
from ..models import Diagnosis
from visits.models import Visit
from clinical.models import ClinicalRecord


class DiagnosisSerializer(serializers.ModelSerializer):
    """
    Serializer for Diagnosis model.

    - patient_name: Computed read-only field from the visit's patient.
    - visit: Must have an existing clinical record before adding diagnoses.
    - Prevents duplicate conditions for the same visit.
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
        if request and request.user.hospital_id:
            self.fields["visit"].queryset = Visit.objects.filter(
                patient__user__hospital=request.user.hospital
            )

    class Meta:
        model = Diagnosis
        fields = [
            "id",
            "visit",
            "patient_name",
            "condition",
            "icd10_code",
            "severity",
            "status",
            "notes",
            "diagnosed_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "diagnosed_at",
        ]

    def validate_visit(self, value):
        """
        Ensure the selected visit has a clinical record before a
        diagnosis can be added.
        """
        if not ClinicalRecord.objects.filter(visit=value).exists():
            raise serializers.ValidationError(
                "Diagnosis must belong to a visit that has a clinical record."
            )
        return value

    def validate(self, attrs):
        """
        Prevent duplicate diagnoses for the same condition during
        the same visit.
        """
        visit = attrs.get("visit", getattr(self.instance, "visit", None))
        condition = attrs.get(
            "condition", getattr(self.instance, "condition", None)
        )
        if visit and condition:
            duplicate_exists = (
                Diagnosis.objects.filter(
                    visit=visit, condition__iexact=condition
                )
                .exclude(pk=getattr(self.instance, "pk", None))
                .exists()
            )
            if duplicate_exists:
                raise serializers.ValidationError(
                    {
                        "condition": "A diagnosis for this condition already exists for this visit."
                    }
                )
        return attrs
