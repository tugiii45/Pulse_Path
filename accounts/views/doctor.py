"""
Doctor API views for PulsePath.

Provides list, create, retrieve, update, and delete endpoints for
doctor profiles. Supports filtering by department, specialization,
and experience. Hospital-scoped via the HospitalQuerySetMixin.
"""

from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated
from accounts.models import Doctor, Department
from accounts.serializers import (DoctorSerializer, AdminCreateDoctorSerializer)
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
from .mixins import HospitalQuerySetMixin
from drf_spectacular.utils import (extend_schema,extend_schema_view,OpenApiParameter,OpenApiTypes,)
from rest_framework.response import Response

class DoctorListView(HospitalQuerySetMixin, generics.ListAPIView):
    """
    List doctors within the authenticated user's hospital.

    Doctor accounts are not created through this endpoint.
    Doctor creation is handled exclusively through the admin-only
    doctor provisioning endpoint.
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "department",
        "specialization",
        "years_of_experience",
    ]

    search_fields = [
        "specialization",
        "user__first_name",
        "user__last_name",
        "license_number",
    ]

    ordering_fields = [
        "created_at",
        "years_of_experience",
    ]

    ordering = ["-created_at"]

    permission_classes = [IsAuthenticated]

    use_user_field = False
    hospital_field = "department__hospital"

class DoctorDetailView(
    HospitalQuerySetMixin,
    generics.RetrieveUpdateDestroyAPIView,
):
    """
    Retrieve, update, or delete a doctor profile.

    Access is restricted to administrators and doctors within the
    appropriate hospital scope.
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsDoctorOrAdmin]
    hospital_field = "department__hospital"    

class HospitalDoctorsView(generics.ListAPIView):
    """
    Returns doctors belonging to a selected hospital.

    Used by patients when booking appointments.
    """

    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        hospital_id = self.request.query_params.get("hospital")

        if not hospital_id:
            return Doctor.objects.none()

        return Doctor.objects.filter(
            department__hospital_id=hospital_id,
            department__hospital__is_active=True,
        ).select_related(
            "user",
            "department",
            "department__hospital",
        )

class AdminCreateDoctorView(generics.CreateAPIView):
    """
    Allows administrators to provision doctor accounts.

    The doctor is created with:
    - a CustomUser account with DOCTOR role
    - hospital derived from the selected department
    - a Doctor profile

    The doctor does not receive a password from the administrator.
    An invitation email will be sent so the doctor can set their password.
    """

    serializer_class = AdminCreateDoctorSerializer
    permission_classes = [IsAdmin]

    def create(self, request, *args, **kwargs):
        """
        Create the doctor using the admin serializer and return the
        resulting Doctor profile using the standard DoctorSerializer.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        doctor = serializer.save()

        response_serializer = DoctorSerializer(
            doctor,
            context={"request": request},
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )