from rest_framework import generics
from ..models import SideEffectReport
from ..serializers import SideEffectReportSerializer
from accounts.permissions import *
from rest_framework.permissions import IsAuthenticated
from accounts.views.mixins import HospitalQuerySetMixin
from notifications.services import create_notification
from notifications.models import Notification

class SideEffectReportListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    serializer_class = SideEffectReportSerializer

    hospital_field = "patient__user__hospital"
    doctor_field = "prescription__diagnosis__visit__doctor__user"
    patient_field = "patient__user"

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsPatient]
        else:
            permission_classes = [IsDoctorOrAdminOrPatientOwner]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # unchanged — keep your existing notification logic here
        ...


class SideEffectReportDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SideEffectReportSerializer
    permission_classes = [IsDoctorOrAdminOrPatientOwner]

    hospital_field = "patient__user__hospital"
    doctor_field = "prescription__diagnosis__visit__doctor__user"
    patient_field = "patient__user"