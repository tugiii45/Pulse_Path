from rest_framework import serializers
from ..models import MedicationSchedule


class MedicationScheduleSerializer(serializers.ModelSerializer):
    prescription_details = serializers.ReadOnlyField(source='prescription.medication.name')

    class Meta:
        model = MedicationSchedule
        fields = [ 'id', 'prescription', 'prescription_details', 'scheduled_time', 'start_date', 'end_date', 'is_active', 'created_at']

        read_only_fields = ['id', 'created_at']

