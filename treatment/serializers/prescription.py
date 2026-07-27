from rest_framework import serializers
from ..models import Prescription

class PrescriptionSerializer(serializers.ModelSerializer):
    medication_name = serializers.ReadOnlyField(source='medication.name')

    class Meta:
        model = Prescription
        fields = ['id', 'diagnosis', 'medication', 'medication_name', 'dosage', 'frequency', 'duration', 'instructions', 'prescribed_at', 'updated_at']

        read_only_fields = [
            'id',
            'prescribed_at',
            'updated_at',
        ]