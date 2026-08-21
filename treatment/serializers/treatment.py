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

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        prescription = attrs.get(
            "prescription",
            getattr(self.instance, "prescription", None),
        )

        if not prescription:
            raise serializers.ValidationError({
                "prescription": "A prescription is required."
            })

        # Superadmin can work across hospitals.
        if user.is_superuser:
            return attrs

        # Doctors can only manage treatments attached to
        # prescriptions belonging to their own patients.
        if user.role == "DOCTOR":
            prescription_doctor = (
                prescription
                .diagnosis
                .visit
                .doctor
                .user
            )

            if prescription_doctor != user:
                raise serializers.ValidationError({
                    "prescription": (
                        "You can only manage treatments for "
                        "your own patients."
                    )
                })

        # Hospital admins can only manage treatments within
        # their own hospital.
        elif user.role == "ADMIN":
            if not user.hospital_id:
                raise serializers.ValidationError({
                    "prescription": (
                        "Your account is not associated with a hospital."
                    )
                })

            prescription_hospital = (
                prescription
                .diagnosis
                .visit
                .patient
                .user
                .hospital_id
            )

            if prescription_hospital != user.hospital_id:
                raise serializers.ValidationError({
                    "prescription": (
                        "You can only manage treatments "
                        "within your hospital."
                    )
                })

        # Patients cannot create or modify treatments.
        elif user.role == "PATIENT":
            raise serializers.ValidationError({
                "prescription": (
                    "Patients cannot create or modify treatments."
                )
            })

        else:
            raise serializers.ValidationError(
                "You are not authorized to manage treatments."
            )

        return attrs