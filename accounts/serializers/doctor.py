from rest_framework import serializers
from ..models import Doctor, Department
from rest_framework.exceptions import ValidationError

class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Doctor
        fields = ["id", "user", "full_name", "email", "department", "department_name", "specialization", "license_number", "years_of_experience", "created_at"]

        read_only_fields = ["id", "created_at", "full_name", "email", "department_name"] 

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.hospital_id:
            self.fields["department"].queryset = Department.objects.filter(
                hospital=request.user.hospital
            )

    def validate_department(self, value):
        if value is not None:
            request = self.context.get("request")
            if request and request.user.hospital_id and value.hospital_id != request.user.hospital_id:
                raise ValidationError(
                    "The selected department does not belong to your hospital."
                )
        return value
