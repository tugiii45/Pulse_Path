from django.db.models import Q


class HospitalQuerySetMixin:
    """
    Mixin for views that automatically filters querysets by the requesting
    user's hospital.

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

    # The ORM path to the hospital field on the model.
    hospital_field = None

    # Convenience flags for common field paths.
    use_patient_field = False
    use_doctor_field = False
    use_user_field = False
    use_created_by_field = False
    use_recipient_field = False

    def get_queryset(self):
        """
        Return the queryset filtered to the current user's hospital.
        Superusers bypass the filter.
        """
        user = self.request.user

        # Superusers see everything.
        if user.is_superuser:
            return super().get_queryset()

        # If the user has no hospital, return an empty queryset.
        if not user.hospital_id:
            return super().get_queryset().none()

        hospital = user.hospital

        # Build the filter based on the configured field path.
        filter_kwargs = self._build_hospital_filter(hospital)

        return super().get_queryset().filter(**filter_kwargs)

    def _build_hospital_filter(self, hospital):
        """Build the ORM filter kwargs for the given hospital."""
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

        # Default: try the most common path.
        return {"patient__user__hospital": hospital}
