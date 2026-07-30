from rest_framework import serializers
from ..models import CustomUser, Hospital


class ActiveHospitalField(serializers.PrimaryKeyRelatedField):
    """Only allow selecting active hospitals."""

    def get_queryset(self):
        return Hospital.objects.filter(is_active=True)


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)
    hospital = ActiveHospitalField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'phone_number', 'role', 'hospital')

    def create(self, validated_data):
            password = validated_data.pop('password')
            user = CustomUser(**validated_data)
            user.set_password(password)
            user.save()
            return user


class ProfileSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)

    class Meta:
        model = CustomUser    
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'hospital', 'hospital_name', 'is_active', 'date_joined')
        read_only_fields = fields
