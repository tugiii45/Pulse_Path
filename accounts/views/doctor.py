"""
Doctor API views for PulsePath.

Provides list, retrieve, update, and delete endpoints for doctor
profiles. Supports filtering by department, specialization, and
experience. Hospital-scoped via the HospitalQuerySetMixin.

NOTE: Doctor account creation now happens exclusively through
AdminCreateDoctorView (accounts/views/doctor_provisioning.py), which
creates the CustomUser + Doctor profile together and emails an
account-activation link. Doctors never self-register or self-create
a Doctor profile, so POST is disabled on this view.
"""

from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from accounts.models import Doctor, Department
from accounts.serializers import DoctorSerializer
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
from .mixins import HospitalQuerySetMixin
from drf_spectacular.utils import (extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes,)


class DoctorListCreateView(HospitalQuerySetMixin, generics.ListAPIView):
    """
    List all doctors (with filtering). Read-only -- see module
    docstring for why creation was moved to AdminCreateDoctorView.

    Filtering:
    - By department, specialization, and years of experience.
    - Search by specialization, name, and license number.
    - Order by creation date or experience.
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = ["department", "specialization", "years_of_experience"]

    search_fields = [
        "specialization",
        "user__first_name",
        "user__last_name",
        "license_number",
    ]

    ordering_fields = ["created_at", "years_of_experience"]

    ordering = ["-created_at"]

    use_user_field = False
    hospital_field = "department__hospital"


class DoctorDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific doctor profile.

    Requires DOCTOR or ADMIN role. Hospital-scoped to prevent
    accessing doctors from other hospitals.
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsDoctorOrAdmin]
    hospital_field = "department__hospital"


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="hospital",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            required=True,
            description="ID of the hospital used to filter doctors.",
        ),
    ],
    description=(
        "Returns doctors belonging to the selected hospital. "
        "Doctors are identified through their department's hospital relationship."
    ),
)
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