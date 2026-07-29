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

    def validate_diagnosis(self, value):
        if not value:
            raise serializers.ValidationError("A diagnosis is required.")
        return value

    def validate_dosage(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Dosage is required.")
        return value

    def validate_frequency(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Frequency is required.")
        return value

    def validate_duration(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Duration must be a positive number of days.")
        return value