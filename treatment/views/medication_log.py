from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated

from treatment.models import MedicationLog
from treatment.serializers import MedicationLogSerializer
from accounts.models import Patient
from accounts.permissions import (
    IsPatient,
    IsOwnerOrDoctor,
)

from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin


class MedicationLogListCreateView(
    HospitalQuerySetMixin,
    generics.ListCreateAPIView
):
    serializer_class = MedicationLogSerializer
    permission_classes = [IsAuthenticated]

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
        "medication_schedule__prescription__diagnosis__visit"
        "__patient__user__hospital"
    )

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return MedicationLog.objects.none()

        if user.is_superuser:
            return MedicationLog.objects.all()

        if user.role in ["ADMIN", "DOCTOR"]:
            if user.hospital_id:
                return MedicationLog.objects.filter(
                    medication_schedule__prescription__diagnosis__visit__patient__user__hospital=user.hospital
                )

            return MedicationLog.objects.all()

        if user.role == "PATIENT":
            try:
                patient = user.patient
            except Patient.DoesNotExist:
                return MedicationLog.objects.none()

            return MedicationLog.objects.filter(
                medication_schedule__prescription__diagnosis__visit__patient=patient
            )

        return MedicationLog.objects.none()

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsPatient]
        else:
            permission_classes = [IsAuthenticated]

        return [
            permission()
            for permission in permission_classes
        ]


class MedicationLogDetailView(
    HospitalQuerySetMixin,
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = MedicationLogSerializer

    permission_classes = [
        IsAuthenticated,
        IsOwnerOrDoctor,
    ]

    hospital_field = (
        "medication_schedule__prescription__diagnosis__"
        "visit__patient__user__hospital"
    )

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return MedicationLog.objects.none()

        user = self.request.user

        if user.is_superuser:
            return MedicationLog.objects.all()

        if user.role in ["ADMIN", "DOCTOR"]:
            if user.hospital_id:
                return MedicationLog.objects.filter(
                    medication_schedule__prescription__diagnosis__visit__patient__user__hospital=user.hospital
                )

            return MedicationLog.objects.all()

        if user.role == "PATIENT":
            return MedicationLog.objects.filter(
                medication_schedule__prescription__diagnosis__visit__patient__user=user
            )

        return MedicationLog.objects.none()