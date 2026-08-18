from rest_framework import serializers
from ..models import MedicationLog, MedicationSchedule


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
        user = self.context["request"].user

        # Doctors and admins can work with schedules
        # within their normal permissions.
        if user.role in ["DOCTOR", "ADMIN"] or user.is_superuser:
            return value

        # Patients must have a patient profile.
        if user.role == "PATIENT":
            try:
                patient = user.patient
            except AttributeError:
                raise serializers.ValidationError(
                    "Your account does not have a patient profile."
                )

            # Follow:
            # MedicationSchedule
            # -> Prescription
            # -> Diagnosis
            # -> Visit
            # -> Patient
            schedule_patient = (
                value.prescription
                .diagnosis
                .visit
                .patient
            )

            if schedule_patient != patient:
                raise serializers.ValidationError(
                    "You can only record medication for your own medication schedule."
                )

        return value