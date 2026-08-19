"""
Patient API views for PulsePath.

Provides endpoints for patients to view and update their own profile,
and for doctors/admins to view patient records relevant to them.

Patients are NEVER created through this API directly -- a Patient
record is auto-created by RegisterSerializer whenever a user registers
with role="PATIENT". Allowing manual creation here caused duplicate
Patient rows (violating the one-to-one user_id constraint) whenever
an admin tried to add a patient who had already self-registered.
"""

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.models import Patient
from accounts.serializers import PatientSerializer


class PatientProfileView(generics.RetrieveUpdateAPIView):
    """
    Authenticated endpoint for viewing and updating the current
    patient's own profile.

    Automatically retrieves the Patient record linked to the
    currently logged-in user, so patients cannot access each
    other's profiles.
    """

    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        """Pass the request context to the serializer for user access."""
        return {"request": self.request}

    def get_object(self):
        """
        Return the Patient profile for the currently authenticated user.

        Since each user has at most one Patient profile (OneToOneField),
        this automatically scopes the request to the correct record.
        """
        return Patient.objects.get(user=self.request.user)


class PatientListView(generics.ListAPIView):
    """
    Read-only endpoint for listing patients.

    Patient records are never created here -- see module docstring.
    Visibility is scoped per role:

    - Superusers: all patients.
    - ADMIN: all patients registered at their hospital. New patient
      registrations appear here automatically (Patient rows are
      created by RegisterSerializer at signup time).
    - DOCTOR: only patients they have at least one appointment with
      (past or upcoming), derived from Appointment.patient's related_name
      "appointments" rather than a stored relation, since "allocation"
      happens by booking, not an explicit assignment.
    - Anyone else: no results.
    """

    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Patient.objects.none()

        if user.is_superuser:
            return Patient.objects.all()

        if getattr(user, "role", None) == "ADMIN":
            if not user.hospital_id:
                return Patient.objects.none()
            return Patient.objects.filter(user__hospital=user.hospital)

        if getattr(user, "role", None) == "DOCTOR" and hasattr(user, "doctor"):
            return Patient.objects.filter(
                appointments__doctor=user.doctor
            ).distinct()

        return Patient.objects.none()