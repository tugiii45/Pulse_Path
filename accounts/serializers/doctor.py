from rest_framework import serializers
from ..models import Doctor

class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Doctor
        fields = ["id", "user", "full_name", "email", "department", "department_name", "specialization", "license_number", "years_of_experience", "created_at"]

        read_only_fields = ["id", "created_at", "full_name", "email", "department_name"] 
