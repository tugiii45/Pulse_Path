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


class AppointmentListCreateView(generics.ListCreateAPIView):
    """
    List all appointments or create a new one.

    Supports filtering by patient, doctor, and status.
    Search by patient or doctor name.
    Order by appointment date or creation date.

    NOTE: This view intentionally does NOT use HospitalQuerySetMixin.
    That mixin returns an empty queryset whenever request.user.hospital_id
    is None -- but PATIENT-role users are not tied to a single hospital
    (they pick a hospital per booking), so their hospital_id is always
    None. Using the mixin here silently hid every appointment from every
    patient. Scoping is instead handled explicitly below, per role.

    Patient-role users may create (self-book) appointments; the
    serializer resolves and locks "patient" to request.user.patient
    server-side, so no perform_create override is needed here.
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
        queryset = Appointment.objects.all()
        user = self.request.user

        if not user.is_authenticated:
            return queryset.none()

        if user.is_superuser:
            return queryset

        # Patients see only their own appointments, regardless of
        # which hospital(s) those appointments were booked at.
        if hasattr(user, "patient"):
            return queryset.filter(patient=user.patient)

        # Doctors see only their own appointments.
        if hasattr(user, "doctor"):
            return queryset.filter(doctor=user.doctor)

        # Hospital-scoped admins/staff see appointments at their hospital.
        if getattr(user, "hospital_id", None):
            return queryset.filter(hospital=user.hospital)

        return queryset.none()


class AppointmentDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific appointment.

    Uses IsOwnerOrDoctor permission so patients can only access
    their own appointments while doctors/admins can access all.
    """

    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]