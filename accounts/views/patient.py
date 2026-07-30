"""
Patient API views for PulsePath.

Provides endpoints for patients to view and update their own profile,
and for doctors/admins to list and manage patient records within
their hospital.
"""

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.models import Patient
from accounts.serializers import PatientSerializer
from .mixins import HospitalQuerySetMixin


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


class PatientListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    """
    Endpoint for listing all patients and creating new patient records.

    Hospital-scoped: only returns patients belonging to the current
    user's hospital. Authenticated users can list patients, but
    creation permissions are handled by the serializer.
    """

    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    # Patients connect to hospitals through their user FK.
    hospital_field = "user__hospital"
