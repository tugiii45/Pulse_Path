from rest_framework import serializers
from ..models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)

    class Meta:
        model = Department
        fields = ["id", "name", "description", "hospital", "hospital_name", "created_at"]
        read_only_fields = ["id", "created_at", "hospital_name"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.hospital_id:
            validated_data["hospital"] = request.user.hospital
        return super().create(validated_data)
