from rest_framework import serializers
from ..models import Treatment

class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treatment
        fields = [
            "id",
            "prescription",
            "follow_up_date",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]