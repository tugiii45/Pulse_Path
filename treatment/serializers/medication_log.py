from rest_framework import serializers
from ..models import MedicationLog


class MedicationLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = MedicationLog
        fields = [
            "id",
            "medication_schedule",
            "taken_at",
            "status",
            "notes",
        ]

        read_only_fields = [
            "id",
            "taken_at",
        ]

    def validate_medication_schedule(self, value):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        # Superadmin can work across hospitals.
        if user.is_superuser:
            return value

        # Doctors and admins are restricted by the view's
        # permissions and HospitalQuerySetMixin.
        if user.role in ["DOCTOR", "ADMIN"]:
            return value

        # Patients can only record medication against
        # their own medication schedule.
        if user.role == "PATIENT":
            try:
                patient = user.patient
            except AttributeError:
                raise serializers.ValidationError(
                    "Your account does not have a patient profile."
                )

            schedule_patient = (
                value.prescription
                .diagnosis
                .visit
                .patient
            )

            if schedule_patient != patient:
                raise serializers.ValidationError(
                    "You can only record medication for your own "
                    "medication schedule."
                )

            return value

        raise serializers.ValidationError(
            "You are not authorized to use this medication schedule."
        )