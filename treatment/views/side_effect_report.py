from rest_framework import generics
from ..models import SideEffectReport
from ..serializers import SideEffectReportSerializer
from accounts.permissions import *
from rest_framework.permissions import IsAuthenticated

class SideEffectReportListCreateView(generics.ListCreateAPIView):
    serializer_class = SideEffectReportSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role in ["ADMIN", "DOCTOR"]:
            return SideEffectReport.objects.all()

        return SideEffectReport.objects.filter(
            patient__user=user
        )

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsPatient]
        else:
            permission_classes = [IsDoctorOrAdminOrPatientOwner]

        return [permission() for permission in permission_classes]


class SideEffectReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SideEffectReportSerializer
    permission_classes = [IsDoctorOrAdminOrPatientOwner]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["ADMIN", "DOCTOR"]:
            return SideEffectReport.objects.all()

        return SideEffectReport.objects.filter(
            patient__user=user
        )