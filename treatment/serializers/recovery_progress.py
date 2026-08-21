from rest_framework import serializers
from ..models import RecoveryProgress
from accounts.models import Patient


class RecoveryProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for patient recovery progress.

    Patients can only create recovery progress for their own visits.
    The patient is assigned automatically from the authenticated user.
    """

    class Meta:
        model = RecoveryProgress
        fields = [
            "id",
            "patient",
            "visit",
            "pain_level",
            "body_temperature",
            "feeling_better",
            "notes",
            "improvement_percentage",
            "recorded_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "recorded_at",
        ]

    def validate_pain_level(self, value):
        if value is None:
            raise serializers.ValidationError(
                "Pain level is required."
            )

        if value < 0 or value > 10:
            raise serializers.ValidationError(
                "Pain level must be between 0 and 10."
            )

        return value

    def validate_improvement_percentage(self, value):
        if value is None:
            raise serializers.ValidationError(
                "Improvement percentage is required."
            )

        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Recovery improvement percentage must be between 0 and 100."
            )

        return value

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        # Patient profile is required when creating patient-owned progress.
        if user.role == "PATIENT":
            try:
                patient = user.patient
            except Patient.DoesNotExist:
                raise serializers.ValidationError(
                    "Patient profile not found."
                )

            visit = attrs.get(
                "visit",
                self.instance.visit if self.instance else None,
            )

            if not visit:
                raise serializers.ValidationError({
                    "visit": "A visit is required."
                })

            # A patient can only submit recovery progress
            # for their own visit.
            if visit.patient != patient:
                raise serializers.ValidationError({
                    "visit": (
                        "You can only record recovery progress "
                        "for your own visits."
                    )
                })

        pain_level = attrs.get(
            "pain_level",
            getattr(self.instance, "pain_level", None),
        )

        improvement_percentage = attrs.get(
            "improvement_percentage",
            getattr(self.instance, "improvement_percentage", None),
        )

        feeling_better = attrs.get(
            "feeling_better",
            getattr(self.instance, "feeling_better", None),
        )

        # Clinical consistency check.
        if (
            pain_level is not None
            and pain_level == 0
            and improvement_percentage is not None
            and improvement_percentage < 100
            and feeling_better
        ):
            raise serializers.ValidationError({
                "feeling_better": (
                    "Progress is inconsistent with the reported "
                    "recovery state."
                )
            })

        return attrs