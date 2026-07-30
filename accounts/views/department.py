from rest_framework import generics

from accounts.models import Department
from accounts.serializers import DepartmentSerializer
from accounts.permissions import *
from .mixins import HospitalQuerySetMixin


class DepartmentListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    use_user_field = False

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsDoctorOrAdmin]
        else:
            permission_classes = []

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        # Override to filter departments by the user's hospital directly
        # (departments have a direct hospital FK)
        user = self.request.user
        if user.is_superuser:
            return Department.objects.all()
        if not user.hospital_id:
            return Department.objects.none()
        return Department.objects.filter(hospital=user.hospital)


class DepartmentDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsDoctorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Department.objects.all()
        if not user.hospital_id:
            return Department.objects.none()
        return Department.objects.filter(hospital=user.hospital)
