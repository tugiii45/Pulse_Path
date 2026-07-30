from datetime import date
from rest_framework import serializers
from ..models import MedicationSchedule


# Medication schedules must have a valid range and cannot overlap while active.
class MedicationScheduleSerializer(serializers.ModelSerializer):
    prescription_details = serializers.ReadOnlyField(source='prescription.medication.name')

    class Meta:
        model = MedicationSchedule
        fields = [ 'id', 'prescription', 'prescription_details', 'scheduled_time', 'start_date', 'end_date', 'is_active', 'created_at']

        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        is_active = attrs.get('is_active', getattr(self.instance, 'is_active', True))
        prescription = attrs.get('prescription', getattr(self.instance, 'prescription', None))

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({'end_date': 'End date cannot be earlier than start date.'})

        if is_active and prescription:
            overlapping = MedicationSchedule.objects.filter(
                prescription=prescription,
                is_active=True,
            ).exclude(pk=getattr(self.instance, 'pk', None))
            if start_date and end_date:
                overlapping = overlapping.filter(start_date__lte=end_date, end_date__gte=start_date)
            if overlapping.exists():
                raise serializers.ValidationError({'prescription': 'This prescription already has an overlapping active medication schedule.'})

        return attrs
