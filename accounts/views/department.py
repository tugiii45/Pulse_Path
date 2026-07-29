from rest_framework import generics

from accounts.models import Department
from accounts.serializers import DepartmentSerializer
from accounts.permissions import *


class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsDoctorOrAdmin]
        else:
            permission_classes = []

        return [permission() for permission in permission_classes]


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsDoctorOrAdmin]