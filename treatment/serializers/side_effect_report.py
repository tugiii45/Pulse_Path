from rest_framework import serializers
from ..models import SideEffectReport
from treatment.models import MedicationSchedule


# Side effect reports are only accepted when they relate to an active medication schedule.
class SideEffectReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SideEffectReport
        fields = [ 'id', 'patient', 'prescription', 'medication', 'severity', 'description', 'is_reviewed', 'doctor_response', 'reported_at'] 
        read_only_fields = ['reported_at']

    def validate(self, attrs):
        prescription = attrs.get('prescription', getattr(self.instance, 'prescription', None))
        patient = attrs.get('patient', getattr(self.instance, 'patient', None))

        if prescription and patient:
            has_active_schedule = MedicationSchedule.objects.filter(
                prescription=prescription,
                prescription__diagnosis__visit__patient=patient,
                is_active=True,
            ).exists()
            if not has_active_schedule:
                raise serializers.ValidationError({'prescription': 'Side effect reports require an active medication schedule for this patient prescription.'})

        return attrs