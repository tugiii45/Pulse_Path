from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated

from treatment.models import MedicationLog
from treatment.serializers import MedicationLogSerializer
from accounts.models import Patient
from accounts.permissions import *
   

from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin

class MedicationLogListCreateView(
    HospitalQuerySetMixin,
    generics.ListCreateAPIView,
):
    serializer_class = MedicationLogSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = ["medication_schedule", "status"]
    search_fields = ["notes", "status"]
    ordering_fields = ["taken_at", "status"]
    ordering = ["-taken_at"]

    hospital_field = (
        "medication_schedule__prescription__diagnosis__visit__patient__user__hospital"
    )

    doctor_field = "prescription__diagnosis__visit__appointment__doctor__user"

    patient_field = (
        "medication_schedule__prescription__diagnosis__visit__patient__user"
    )

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsPatient]
        else:
            permission_classes = [
                IsDoctorOrAdminOrPatientOwner
            ]

        return [permission() for permission in permission_classes]


class MedicationLogDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicationLogSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]

    hospital_field = "medication_schedule__prescription__diagnosis__visit__patient__user__hospital"
    doctor_field = "prescription__diagnosis__visit__appointment__doctor__user"
    patient_field = "medication_schedule__prescription__diagnosis__visit__patient__user"