"""
Appointment serializer for PulsePath.

Handles serialization of appointments with comprehensive validation:
- Future dates only (no past appointments).
- Working hours enforcement (8 AM - 5 PM).
- No double-booking for the same patient or doctor.
- Valid status lifecycle transitions.
- Hospital-scoped patient/doctor querysets.
- Patient-role users are auto-bound to their own Patient record,
  so they can self-book without sending (or being able to spoof) "patient".
"""

from django.utils import timezone
from rest_framework import serializers

from ..models import Appointment
from accounts.models import Patient, Doctor, Hospital


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Appointment model.

    - patient_name, doctor_name: Computed read-only display fields.
    - patient/doctor querysets filtered to the user's hospital.
    - Comprehensive cross-field validation for scheduling rules.
    - For PATIENT-role users, "patient" is resolved server-side from
      request.user rather than trusted from the payload.
    """

    patient_name = serializers.CharField(
        source="patient.user.get_full_name",
        read_only=True,
    )
    doctor_name = serializers.CharField(
        source="doctor.user.get_full_name",
        read_only=True,
    )

    hospital_name = serializers.CharField(
        source="hospital.name",
        read_only=True,
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
        0. PATIENT-role users are bound to their own patient record,
           regardless of what (if anything) was sent in the payload.
        1. Patient cannot have two appointments at the same time.
        2. Doctor cannot have two appointments at the same time.
        3. Appointments must be within working hours (8 AM - 5 PM).
        4. Status transitions must follow the valid lifecycle.
        """
        request = self.context.get("request")
        user = getattr(request, "user", None)

        # Rule 0: Resolve/lock the patient for PATIENT-role users so they
        # can only ever book for themselves, no matter what the client
        # sends. Other roles (doctor/admin) must supply "patient" explicitly.
        if user is not None and getattr(user, "role", None) == "PATIENT":
            patient_profile = getattr(user, "patient", None)
            if patient_profile is None:
                raise serializers.ValidationError({
                    "patient": (
                        "Your account is not linked to a patient profile. "
                        "Please contact support."
                    )
                })
            attrs["patient"] = patient_profile
        elif "patient" not in attrs and not self.instance:
            raise serializers.ValidationError({
                "patient": "This field is required."
            })

        patient = attrs.get(
            "patient",
            self.instance.patient if self.instance else None,
        )

        doctor = attrs.get(
            "doctor",
            self.instance.doctor if self.instance else None,
        )

        # Derive hospital from the doctor's department if the client
        # didn't send one explicitly. Only applies on create — updates
        # fall back to the existing instance's hospital as before.
        if "hospital" not in attrs and not self.instance and doctor and doctor.department:
            attrs["hospital"] = doctor.department.hospital

        hospital = attrs.get(
            "hospital",
            self.instance.hospital if self.instance else None,
        )

        if hospital and not hospital.is_active:
            raise serializers.ValidationError({
                "hospital": "This hospital is not currently available for appointments."
            })

        if doctor and hospital:
            if not doctor.department:
                raise serializers.ValidationError({
                    "doctor": "This doctor is not assigned to a department."
                })

            if doctor.department.hospital_id != hospital.id:
                raise serializers.ValidationError({
                    "doctor": (
                        "The selected doctor does not belong to "
                        "the selected hospital."
                    )
                })

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
            "hospital",
            "hospital_name",
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
            "patient_name",
            "hospital_name",
            "doctor_name",
        ]
        extra_kwargs = {
            # Not required at the request level — PATIENT-role users don't
            # send it (it's resolved server-side in validate()). Doctor/
            # admin requests still must supply it explicitly.
            "patient": {"required": False},
            # Not required at the request level — derived from the
            # selected doctor's department when omitted. See validate().
            "hospital": {"required": False},
        }