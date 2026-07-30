"""
Department API views for PulsePath.

Provides list, create, retrieve, update, and delete endpoints for
hospital departments. Departments are scoped to the user's hospital.
Only doctors and admins can create, update, or delete departments.
"""

from rest_framework import generics

from accounts.models import Department
from accounts.serializers import DepartmentSerializer
from accounts.permissions import *
from .mixins import HospitalQuerySetMixin


class DepartmentListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    """
    List all departments in the user's hospital, or create a new one.

    POST requests require DOCTOR or ADMIN role. Listing is open to
    all authenticated users, but only shows departments in the
    current user's hospital.
    """

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    use_user_field = False

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

    def get_queryset(self):
        """
        Override to filter departments by the user's hospital directly.

        Departments have a direct hospital FK, so we filter on
        hospital rather than going through a complex relationship path.
        """
        user = self.request.user
        if user.is_superuser:
            return Department.objects.all()
        if not user.hospital_id:
            return Department.objects.none()
        return Department.objects.filter(hospital=user.hospital)


class DepartmentDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific department.

    Requires DOCTOR or ADMIN role. Only returns departments within
    the current user's hospital.
    """

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsDoctorOrAdmin]

    def get_queryset(self):
        """
        Override to scope department access to the user's hospital.
        """
        user = self.request.user
        if user.is_superuser:
            return Department.objects.all()
        if not user.hospital_id:
            return Department.objects.none()
        return Department.objects.filter(hospital=user.hospital)
