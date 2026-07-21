from rest_framework import serializers
from ..models import ClinicalRecord

class ClinicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.user.get_full_name", read_only=True)

    class Meta:
        model = ClinicalRecord
        fields = [
            "id",
            "patient",
            "patient_name",
            "allergies",
            "chronic_conditions",
            "current_medications",
            "family_history",
            "medical_notes",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            
        ]