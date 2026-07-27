from rest_framework import serializers
from ..models import Diagnosis
from visits.models import Visit

class DiagnosisSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="visit.patient.user.get_full_name", read_only=True)
    visit = serializers.PrimaryKeyRelatedField(queryset=Visit.objects.all())

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
