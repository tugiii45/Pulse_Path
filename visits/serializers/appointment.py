from rest_framework import serializers
from ..models import Appointment
from django.utils import timezone

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.user.get_full_name", read_only=True)
    doctor_name = serializers.CharField(source="doctor.user.get_full_name", read_only=True)

    def validate_appointment_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError(
            "Appointment date cannot be in the past."
        )
        return value

    def validate(self, attrs):
      patient = attrs.get(
       "patient",
       self.instance.patient if self.instance else None
       )

      doctor = attrs.get(
       "doctor",
       self.instance.doctor if self.instance else None
        )
      appointment_date = attrs.get(
       "appointment_date",
       self.instance.appointment_date if self.instance else None
        )

      queryset = Appointment.objects.all()

    # Ignore current object during updates
      if self.instance:
        queryset = queryset.exclude(pk=self.instance.pk)

      if queryset.filter(
        patient=patient,
        appointment_date=appointment_date
      ).exists():
        raise serializers.ValidationError({
            "patient": "The patient already has an appointment at this time."
        })

      if queryset.filter(
        doctor=doctor,
        appointment_date=appointment_date
      ).exists():
        raise serializers.ValidationError({
         "doctor": "The doctor already has an appointment at this time."
    })

      appointment_time = appointment_date.time()

      if appointment_time.hour < 8 or appointment_time.hour >= 17:
       raise serializers.ValidationError({
        "appointment_date":
        "Appointments can only be booked between 8:00 AM and 5:00 PM."
    })


      # Validate status transitions
      if self.instance:
       current_status = self.instance.status
       new_status = attrs.get("status", current_status)

       allowed_transitions = {
        "PENDING": ["CONFIRMED", "CANCELLED"],
        "CONFIRMED": ["COMPLETED", "CANCELLED"],
        "COMPLETED": [],
        "CANCELLED": [],
    }

      if (
        new_status != current_status
        and new_status not in allowed_transitions[current_status]
    ):
        raise serializers.ValidationError({
            "status": (
                f"Cannot change appointment status from "
                f"{current_status} to {new_status}."
            )
        })

      return attrs

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "appointment_date",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]