from rest_framework import serializers
from ..models import SideEffectReport
from treatment.models import MedicationSchedule
from accounts.models import Patient


class SideEffectReportSerializer(serializers.ModelSerializer):

    class Meta:
        model = SideEffectReport
        fields = [
            "id",
            "patient",
            "prescription",
            "medication",
            "severity",
            "description",
            "is_reviewed",
            "doctor_response",
            "reported_at",
        ]

        # is_reviewed / doctor_response are now writable so doctors can
        # mark reports as reviewed and respond — but validate() below
        # ensures only DOCTOR/ADMIN can touch them, and only on update.
        read_only_fields = [
            "id",
            "patient",
            "medication",
            "reported_at",
        ]

    # Fields a patient can set at creation. Nothing else should ever
    # come from a patient, and nothing here should change after creation.
    PATIENT_EDITABLE_ON_CREATE = {"prescription", "severity", "description"}

    # Fields a doctor/admin is allowed to touch on update.
    DOCTOR_EDITABLE_ON_UPDATE = {"is_reviewed", "doctor_response"}

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        # ----- UPDATE PATH -----
        if self.instance is not None:
            if user.role in ["DOCTOR", "ADMIN"]:
                # Doctors/admins may only change the review fields.
                for field, value in attrs.items():
                    if field in self.DOCTOR_EDITABLE_ON_UPDATE:
                        continue
                    if value != getattr(self.instance, field):
                        raise serializers.ValidationError({
                            field: (
                                "You can only update is_reviewed "
                                "and doctor_response."
                            )
                        })
                return attrs

            if user.role == "PATIENT":
                # Patients have read-only access at the permission layer
                # already, but block here too as defense in depth.
                raise serializers.ValidationError(
                    "Patients cannot modify side effect reports."
                )

            raise serializers.ValidationError(
                "You are not authorized to update this report."
            )

        # ----- CREATE PATH (unchanged logic below) -----
        if user.role != "PATIENT":
            raise serializers.ValidationError(
                "Only patients can create side effect reports."
            )

        try:
            patient = user.patient
        except Patient.DoesNotExist:
            raise serializers.ValidationError(
                "Patient profile not found."
            )

        prescription = attrs.get("prescription")

        if not prescription:
            raise serializers.ValidationError({
                "prescription": "A prescription is required."
            })

        prescription_patient = (
            prescription
            .diagnosis
            .visit
            .patient
        )

        if prescription_patient != patient:
            raise serializers.ValidationError({
                "prescription": (
                    "This prescription does not belong to you."
                )
            })

        has_active_schedule = MedicationSchedule.objects.filter(
            prescription=prescription,
            prescription__diagnosis__visit__patient=patient,
            is_active=True,
        ).exists()

        if not has_active_schedule:
            raise serializers.ValidationError({
                "prescription": (
                    "You can only report side effects for an active "
                    "medication assigned to you."
                )
            })

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        patient = request.user.patient
        prescription = validated_data["prescription"]

        return SideEffectReport.objects.create(
            patient=patient,
            prescription=prescription,
            medication=prescription.medication,
            severity=validated_data["severity"],
            description=validated_data["description"],
        )