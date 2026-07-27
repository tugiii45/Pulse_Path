from rest_framework import serializers
from ..models import MedicationLog

class MedicationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationLog
        fields = ["id", "medication_schedule", "taken_at", "status", "notes",]

        read_only_fields = ["id", "taken_at", ]