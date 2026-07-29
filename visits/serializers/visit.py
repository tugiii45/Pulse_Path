from rest_framework import serializers
from ..models import Visit
from ..models.appointment import Appointment


class VisitSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.user.get_full_name",
        read_only=True
    )

    appointment = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all()
       
    )


    def validate(self, attrs):
       appointment = attrs.get("appointment")

       if not appointment:
        raise serializers.ValidationError({
            "appointment": "An appointment is required to create a visit."
        })

       if appointment.status != "CONFIRMED":
        raise serializers.ValidationError({
            "appointment": "Only confirmed appointments can be used to create a visit."
        })

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