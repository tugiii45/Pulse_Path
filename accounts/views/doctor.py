"""
Doctor API views for PulsePath.

Provides list, create, retrieve, update, and delete endpoints for
doctor profiles. Supports filtering by department, specialization,
and experience. Hospital-scoped via the HospitalQuerySetMixin.
"""

from rest_framework import generics, filters

from accounts.models import Doctor, Department
from accounts.serializers import DoctorSerializer
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
from .mixins import HospitalQuerySetMixin


class DoctorListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    """
    List all doctors (with filtering) or create a new doctor profile.

    Filtering:
    - By department, specialization, and years of experience.
    - Search by specialization, name, and license number.
    - Order by creation date or experience.

    POST requests require DOCTOR or ADMIN role.
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

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
    hospital_field = "user__hospital"

    def get_permissions(self):
        """
        Dynamic permissions:
        - POST: requires DOCTOR or ADMIN role.
        - GET: open to any authenticated user.
        """
        if self.request.method == "POST":
            permission_classes = [IsDoctorOrAdmin]
        else:
            permission_classes = []

        return [permission() for permission in permission_classes]


class DoctorDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific doctor profile.

    Requires DOCTOR or ADMIN role. Hospital-scoped to prevent
    accessing doctors from other hospitals.
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsDoctorOrAdmin]
    hospital_field = "user__hospital"
