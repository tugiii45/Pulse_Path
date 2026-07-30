"""
Appointment serializer for PulsePath.

Handles serialization of appointments with comprehensive validation:
- Future dates only (no past appointments).
- Working hours enforcement (8 AM - 5 PM).
- No double-booking for the same patient or doctor.
- Valid status lifecycle transitions.
- Hospital-scoped patient/doctor querysets.
"""

from django.utils import timezone
from rest_framework import serializers

from ..models import Appointment
from accounts.models import Patient, Doctor


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Appointment model.

    - patient_name, doctor_name: Computed read-only display fields.
    - patient/doctor querysets filtered to the user's hospital.
    - Comprehensive cross-field validation for scheduling rules.
    """

    patient_name = serializers.CharField(
        source="patient.user.get_full_name",
        read_only=True,
    )
    doctor_name = serializers.CharField(
        source="doctor.user.get_full_name",
        read_only=True,
    )

    def __init__(self, *args, **kwargs):
        """
        Initialize and filter patient/doctor querysets to the
        current user's hospital.
        """
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if (
            request
            and request.user.is_authenticated
            and request.user.hospital_id
        ):
            hospital = request.user.hospital
            self.fields["patient"].queryset = Patient.objects.filter(
                user__hospital=hospital
            )
            self.fields["doctor"].queryset = Doctor.objects.filter(
                user__hospital=hospital
            )

    def validate_appointment_date(self, value):
        """
        Ensure the appointment date is in the future.

        Prevents booking appointments for past dates/times.
        """
        if value < timezone.now():
            raise serializers.ValidationError(
                "Appointment date cannot be in the past."
            )
        return value

    def validate(self, attrs):
        """
        Comprehensive cross-field validation for appointments.

        Rules enforced:
        1. Patient cannot have two appointments at the same time.
        2. Doctor cannot have two appointments at the same time.
        3. Appointments must be within working hours (8 AM - 5 PM).
        4. Status transitions must follow the valid lifecycle.
        """
        patient = attrs.get(
            "patient",
            self.instance.patient if self.instance else None,
        )

        doctor = attrs.get(
            "doctor",
            self.instance.doctor if self.instance else None,
        )

        appointment_date = attrs.get(
            "appointment_date",
            self.instance.appointment_date if self.instance else None,
        )

        queryset = Appointment.objects.all()

        # Exclude the current appointment when updating to avoid
        # false conflicts with itself.
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        # Rule 1: No double-booking the same patient at the same time.
        if queryset.filter(
            patient=patient,
            appointment_date=appointment_date,
        ).exists():
            raise serializers.ValidationError({
                "patient": "The patient already has an appointment at this time."
            })

        # Rule 2: No double-booking the same doctor at the same time.
        if queryset.filter(
            doctor=doctor,
            appointment_date=appointment_date,
        ).exists():
            raise serializers.ValidationError({
                "doctor": "The doctor already has an appointment at this time."
            })

        # Rule 3: Enforce working hours (8:00 AM - 5:00 PM).
        if appointment_date:
            appointment_time = appointment_date.time()

            if appointment_time.hour < 8 or appointment_time.hour >= 17:
                raise serializers.ValidationError({
                    "appointment_date": (
                        "Appointments can only be booked between "
                        "8:00 AM and 5:00 PM."
                    )
                })

        # Rule 4: Validate status lifecycle transitions.
        # Only allow forward transitions through the appointment lifecycle.
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
