from rest_framework import serializers
from ..models import RecoveryProgress

class RecoveryProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecoveryProgress
        fields = ['id', 'patient', 'visit', 'pain_level', 'body_temperature', 'feeling_better', 'notes', 'improvement_percentage', 'recorded_at']

        read_only_fields = ['id', 'recorded_at']

        def validate_pain_level(self, value):
            if value < 0 or value > 10:
                raise serializers.ValidationError("Pain level must be between 0 and 10")
            return value

        def validate_improvement_percentage(self, value):
            if value < 0 or value > 100:
                raise serializers.ValidationError("Recovery improvement percentage must be between 0 and 100")
            return value