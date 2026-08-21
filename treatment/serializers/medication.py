from rest_framework import serializers
from ..models import *

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = "__all__"

class HospitalMedicationSerializer(serializers.ModelSerializer):
    medication_name = serializers.CharField(source="medication.name", read_only=True)

    class Meta:
        model = HospitalMedication
        fields = [
            "id",
            "hospital",
            "medication",
            "medication_name",
            "is_available",
            "created_at",
        ]
