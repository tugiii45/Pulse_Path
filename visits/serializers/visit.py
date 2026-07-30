"""
Visit serializer for PulsePath.

Handles serialization of patient visits with validation ensuring
only confirmed appointments can create visits, and preventing
duplicate visits for the same appointment.
"""

from rest_framework import serializers
from ..models import Visit
from ..models.appointment import Appointment


class VisitSerializer(serializers.ModelSerializer):
    """
    Serializer for Visit model.

    - patient_name: Computed read-only field from the related Patient's user.
    - appointment: Must be a confirmed appointment that doesn't already
      have a visit associated with it.
    - appointment queryset is filtered to the user's hospital.
    """

    patient_name = serializers.CharField(
        source="patient.user.get_full_name",
        read_only=True,
    )

    appointment = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all()
    )

    def __init__(self, *args, **kwargs):
        """
        Filter the appointment queryset to only include appointments
        from the current user's hospital.
        """
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.hospital_id:
            self.fields["appointment"].queryset = Appointment.objects.filter(
                doctor__user__hospital=request.user.hospital
            )

    def validate(self, attrs):
        """
        Validate the visit data:
        1. An appointment is required.
        2. The appointment must have CONFIRMED status.
        3. A visit cannot already exist for this appointment.
        """
        appointment = attrs.get("appointment")

        if not appointment:
            raise serializers.ValidationError({
                "appointment": "An appointment is required to create a visit."
            })

        # Only confirmed appointments can be converted into visits.
        if appointment.status != "CONFIRMED":
            raise serializers.ValidationError({
                "appointment": "Only confirmed appointments can be used to create a visit."
            })

        # Prevent creating multiple visits for the same appointment.
        if hasattr(appointment, "visit"):
            if not self.instance or appointment.visit.pk != self.instance.pk:
                raise serializers.ValidationError({
                    "appointment": "A visit has already been created for this appointment."
                })

        return attrs

    class Meta:
        model = Visit
        fields = [
            "id",
            "appointment",
            "patient",
            "patient_name",
            "visit_date",
            "reason",
            "symptoms",
            "diagnosis",
            "notes",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "visit_date",
            "created_at",
        ]
