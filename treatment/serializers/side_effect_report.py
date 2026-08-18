from rest_framework import serializers
from ..models import SideEffectReport
from treatment.models import MedicationSchedule
from accounts.models import Patient


class SideEffectReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SideEffectReport
        fields = [
            'id',
            'patient',
            'prescription',
            'medication',
            'severity',
            'description',
            'is_reviewed',
            'doctor_response',
            'reported_at',
        ]
        read_only_fields = [
            'id',
            'patient',
            'medication',
            'is_reviewed',
            'doctor_response',
            'reported_at',
        ]

    def validate(self, attrs):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        try:
            patient = request.user.patient
        except Patient.DoesNotExist:
            raise serializers.ValidationError(
                "Patient profile not found."
            )

        prescription = attrs.get('prescription')

        if not prescription:
            raise serializers.ValidationError({
                'prescription': 'A prescription is required.'
            })

        has_active_schedule = MedicationSchedule.objects.filter(
            prescription=prescription,
            prescription__diagnosis__visit__patient=patient,
            is_active=True,
        ).exists()

        if not has_active_schedule:
            raise serializers.ValidationError({
                'prescription': (
                    'You can only report side effects for an active '
                    'medication assigned to you.'
                )
            })

        return attrs

    def create(self, validated_data):
        request = self.context['request']
        patient = request.user.patient
        prescription = validated_data['prescription']

        return SideEffectReport.objects.create(
            patient=patient,
            prescription=prescription,
            medication=prescription.medication,
            severity=validated_data['severity'],
            description=validated_data['description'],
        )