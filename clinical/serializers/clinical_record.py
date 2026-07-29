from rest_framework import serializers
from ..models import ClinicalRecord
from visits.models import Visit


class ClinicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="visit.patient.user.get_full_name", read_only=True)
    visit = serializers.PrimaryKeyRelatedField(queryset=Visit.objects.all())

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
        if not value:
            raise serializers.ValidationError("A visit is required.")
        if self.instance is None and ClinicalRecord.objects.filter(visit=value).exists():
            raise serializers.ValidationError("Only one clinical record is allowed per visit.")
        return value
        