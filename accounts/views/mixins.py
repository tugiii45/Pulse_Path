"""
Hospital query set mixin for PulsePath.

Provides a reusable mixin that automatically filters querysets to
only include records belonging to the current user's hospital. This
is the foundation of the multi-tenant data isolation strategy.

Usage:
    class MyView(HospitalQuerySetMixin, generics.ListCreateAPIView):
        hospital_field = "patient__user__hospital"  # configurable

Supported configurations:
    - hospital_field: The Django ORM relationship path to the Hospital
      model from the view's model. Defaults to "patient__user__hospital".
    - use_patient_field: Set to True if the model has a direct 'patient' FK.
    - use_doctor_field: Set to True if the model has a direct 'doctor' FK.
    - use_user_field: Set to True if the model has a direct 'user' FK.
    - use_created_by_field: Set to True if the model has a 'created_by' FK
      to CustomUser.
    - use_recipient_field: Set to True if the model has a 'recipient' FK
      to CustomUser.
"""


class HospitalQuerySetMixin:
    """
    Ensures list and detail views only return records belonging to the
    current user's hospital, doctor, or patient scope — in that priority
    order: doctor/patient scoping first (if configured), hospital-wide
    scoping as the fallback.

    Superusers bypass all filters and see every record.
    """

    hospital_field = None
    doctor_field = None   # ORM path ending at the doctor's CustomUser
    patient_field = None  # ORM path ending at the patient's CustomUser

    use_patient_field = False
    use_doctor_field = False
    use_user_field = False
    use_created_by_field = False
    use_recipient_field = False

    def get_queryset(self):
     if not self.request.user.is_authenticated:
        return super().get_queryset().none()

     user = self.request.user

     if user.is_superuser:
        return super().get_queryset()

     role = getattr(user, "role", None)

     if role == "DOCTOR" and self.doctor_field:
        return super().get_queryset().filter(
            **{self.doctor_field: user}
        )

     if role == "PATIENT" and self.patient_field:
        return super().get_queryset().filter(
            **{self.patient_field: user}
        )

     if role == "ADMIN":
        if not user.hospital_id:
            return super().get_queryset().none()

        return super().get_queryset().filter(
            **self._build_hospital_filter(user.hospital)
        )

     return super().get_queryset().none()

    def _build_hospital_filter(self, hospital):
        if self.hospital_field:
            return {self.hospital_field: hospital}

        if self.use_patient_field:
            return {"patient__user__hospital": hospital}

        if self.use_doctor_field:
            return {"doctor__user__hospital": hospital}

        if self.use_user_field:
            return {"user__hospital": hospital}

        if self.use_created_by_field:
            return {"created_by__hospital": hospital}

        if self.use_recipient_field:
            return {"recipient__hospital": hospital}

        return {"patient__user__hospital": hospital}