from rest_framework import serializers
from accounts.models import Patient

class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ('id', 'full_name', 'email', 'date_of_birth', 'gender', 'blood_group', 'emergency_contact', 'address', 'created_at')
        read_only_fields = ["id", "created_at"]

    def get_full_name(self, obj):
            return obj.user.get_full_name()

    def get_email(self, obj):
            return obj.user.email