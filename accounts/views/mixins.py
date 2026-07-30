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
    Ensures list and detail views only return records belonging to the current
    user's hospital, improving privacy and data scoping.

    Superusers bypass the filter entirely and see all records across
    all hospitals.
    """

    # The ORM path to the hospital field on the model.
    # Example: "patient__user__hospital" for Visit model.
    hospital_field = None

    # Convenience flags for common field paths.
    # These avoid repeating the full ORM path string.
    use_patient_field = False
    use_doctor_field = False
    use_user_field = False
    use_created_by_field = False
    use_recipient_field = False

    def get_queryset(self):
        """
        Return the queryset filtered to the current user's hospital.

        Superusers see everything. Users without a hospital assignment
        get an empty queryset. Otherwise, the queryset is filtered
        using the configured hospital field path.
        """
        user = self.request.user

        # Superusers bypass the hospital filter and see all records.
        if user.is_superuser:
            return super().get_queryset()

        # If the user has no hospital, they cannot see any records.
        if not user.hospital_id:
            return super().get_queryset().none()

        hospital = user.hospital

        # Build the filter based on the configured field path.
        filter_kwargs = self._build_hospital_filter(hospital)

        return super().get_queryset().filter(**filter_kwargs)

    def _build_hospital_filter(self, hospital):
        """
        Build the ORM filter kwargs for the given hospital.

        Uses the configured hospital_field directly, or falls back
        to convenience flags for common relationship paths.
        """
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

        # Default: try the most common path (patient -> user -> hospital).
        return {"patient__user__hospital": hospital}
