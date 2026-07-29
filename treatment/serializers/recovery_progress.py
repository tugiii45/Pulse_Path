from rest_framework import serializers
from ..models import RecoveryProgress


class RecoveryProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecoveryProgress
        fields = ['id', 'patient', 'visit', 'pain_level', 'body_temperature', 'feeling_better', 'notes', 'improvement_percentage', 'recorded_at']

        read_only_fields = ['id', 'recorded_at']

    def validate_pain_level(self, value):
        if value is None:
            raise serializers.ValidationError("Pain level is required.")
        if value < 0 or value > 10:
            raise serializers.ValidationError("Pain level must be between 0 and 10")
        return value

    def validate_improvement_percentage(self, value):
        if value is None:
            raise serializers.ValidationError("Improvement percentage is required.")
        if value < 0 or value > 100:
            raise serializers.ValidationError("Recovery improvement percentage must be between 0 and 100")
        return value

    def validate(self, attrs):
        pain_level = attrs.get('pain_level', getattr(self.instance, 'pain_level', None))
        improvement_percentage = attrs.get('improvement_percentage', getattr(self.instance, 'improvement_percentage', None))
        feeling_better = attrs.get('feeling_better', getattr(self.instance, 'feeling_better', None))

        if pain_level is not None and pain_level == 0 and improvement_percentage is not None and improvement_percentage < 100 and feeling_better:
            raise serializers.ValidationError({'feeling_better': 'Progress is inconsistent with the reported recovery state.'})

        if pain_level is not None and pain_level > 10:
            raise serializers.ValidationError({'pain_level': 'Pain level must be between 0 and 10'})

        if improvement_percentage is not None and improvement_percentage < 0:
            raise serializers.ValidationError({'improvement_percentage': 'Recovery improvement percentage must be between 0 and 100'})

        return attrs