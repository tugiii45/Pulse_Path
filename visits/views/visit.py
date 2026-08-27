"""
Visit API views for PulsePath.

Provides list, create, retrieve, update, and delete endpoints for
patient visits. Supports hospital-scoped access and ownership-based
permissions.
"""

from rest_framework import generics
from ..models import Visit
from ..serializers import VisitSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import *
from accounts.views.mixins import HospitalQuerySetMixin


class VisitListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    """
    List all visits or create a new one.

    - Superusers see all visits across all hospitals.
    - Patients see only their own visits.
    - Doctors/admins see visits within their hospital.
    - Automatically links the visit to the appointment's patient.
    """

    serializer_class = VisitSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    def get_queryset(self):
        """
        Return a queryset scoped to the current user's role.

        Superusers: all visits.
        Patients: only their own visits.
        Doctors/Admins: visits within their hospital.
        """
        # Schema generation uses AnonymousUser — return empty queryset
        if not self.request.user.is_authenticated:
            return Visit.objects.none()

        user = self.request.user

        # Superusers see everything.
        if user.is_superuser:
            return Visit.objects.all()

        # Patients see only their own visits.
        if hasattr(user, "patient"):
            return Visit.objects.filter(patient=user.patient)

        
#
# Patients are not tied to a single hospital -- they pick one
# per booking (see AppointmentListCreateView docstring) -- so
# patient__user__hospital is unreliable and often None. The
# appointment itself always has the correct hospital, so scope
# through that relationship instead.
        if user.hospital_id:
           return Visit.objects.filter(appointment__hospital=user.hospital)

        return Visit.objects.none()

    def perform_create(self, serializer):
        """
        Create a visit and automatically link it to the patient
        from the associated appointment.
        """
        appointment = serializer.validated_data["appointment"]
        serializer.save(patient=appointment.patient)


class VisitDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific visit.

    Uses IsOwnerOrDoctor permission so patients can only access
    their own visits while doctors/admins can access all.
    """

    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
