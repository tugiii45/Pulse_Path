from rest_framework import serializers
from ..models import SideEffectReport


class SideEffectReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SideEffectReport
        fields = [ 'id', 'patient', 'prescription', 'medication', 'severity', 'description', 'is_reviewed', 'doctor_response', 'reported_at'] 
        read_only_fields = ['reported_at']