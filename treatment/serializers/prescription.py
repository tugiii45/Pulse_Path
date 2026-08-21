from rest_framework import serializers
from ..models import Prescription


class PrescriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for prescriptions.

    Ensures required prescription information is provided and prevents
    doctors/admins from attaching prescriptions to diagnoses outside
    their permitted scope.
    """

    medication_name = serializers.ReadOnlyField(
        source="medication.name"
    )

    class Meta:
        model = Prescription
        fields = [
            "id",
            "diagnosis",
            "medication",
            "medication_name",
            "dosage",
            "frequency",
            "duration",
            "instructions",
            "prescribed_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "prescribed_at",
            "updated_at",
        ]

    def validate_diagnosis(self, value):
        if not value:
            raise serializers.ValidationError(
                "A diagnosis is required."
            )

        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        # Superadmin can work across hospitals.
        if user.is_superuser:
            return value

        # Doctors can only prescribe for diagnoses belonging
        # to their own patient visits.
        if user.role == "DOCTOR":
            if value.visit.doctor.user != user:
                raise serializers.ValidationError(
                    "You can only create prescriptions for your own patients."
                )

        # Hospital admins can only work with diagnoses from
        # their own hospital.
        elif user.role == "ADMIN":
            if (
                not user.hospital_id
                or value.visit.patient.user.hospital_id != user.hospital_id
            ):
                raise serializers.ValidationError(
                    "You can only create prescriptions within your hospital."
                )

        # Patients should not be able to create prescriptions.
        elif user.role == "PATIENT":
            raise serializers.ValidationError(
                "Patients cannot create prescriptions."
            )

        else:
            raise serializers.ValidationError(
                "You are not authorized to create a prescription."
            )

        return value

    def validate_dosage(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError(
                "Dosage is required."
            )

        return value

    def validate_frequency(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError(
                "Frequency is required."
            )

        return value

    def validate_duration(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError(
                "Duration must be a positive number of days."
            )

        return value