"""
Appointment API views for PulsePath.

Provides list, create, retrieve, update, and delete endpoints for
appointments. Supports filtering by patient, doctor, and status,
as well as search by name and ordering by date.
"""

from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from ..models import Appointment
from ..serializers import AppointmentSerializer
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin


class AppointmentListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    """
    List all appointments or create a new one.

    Supports filtering by patient, doctor, and status.
    Search by patient or doctor name.
    Order by appointment date or creation date.
    Hospital-scoped via the mixin.
    """

    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = ["patient", "doctor", "hospital",  "status"]
    search_fields = [
        "patient__user__first_name",
        "patient__user__last_name",
        "doctor__user__first_name",
        "doctor__user__last_name",
        "hospital__name",
    ]
    ordering_fields = ["appointment_date", "created_at"]
    ordering = ["-appointment_date"]

    def get_queryset(self):
        queryset = super().get_queryset()

        if not self.request.user.is_authenticated:
            return queryset.none()

        if self.request.user.is_superuser:
            return queryset

        if hasattr(self.request.user, "patient"):
            return queryset.filter(patient=self.request.user.patient)

        return queryset


class AppointmentDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific appointment.

    Uses IsOwnerOrDoctor permission so patients can only access
    their own appointments while doctors/admins can access all.
    """

    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
