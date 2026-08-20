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

    def get_queryset(self):
        # Schema generation uses AnonymousUser — return empty queryset
        if not self.request.user.is_authenticated:
            return SideEffectReport.objects.none()

        user = self.request.user

        if user.is_superuser:
            return SideEffectReport.objects.all()

        if user.role in ["ADMIN", "DOCTOR"]:
            if user.hospital_id:
                return SideEffectReport.objects.filter(
                    patient__user__hospital=user.hospital
                )
            return SideEffectReport.objects.none()

        return SideEffectReport.objects.filter(
            patient__user=user
        )

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsPatient]
        else:
            permission_classes = [IsDoctorOrAdminOrPatientOwner]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        report = serializer.save()

        doctor = report.prescription.diagnosis.visit.doctor.user

        create_notification(
           recipient=doctor,
           created_by=self.request.user,
           title="New Side Effect Report",
           message=(
            f"{report.patient.user.get_full_name()} has submitted a "
            f"{report.severity.lower()} side effect report for "
            f"{report.medication.name}."
        ),
           notification_type=Notification.NotificationType.SIDE_EFFECT,
           notification_key=f"side-effect-report-{report.id}",
    )


class SideEffectReportDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SideEffectReportSerializer
    permission_classes = [IsDoctorOrAdminOrPatientOwner]

    def get_queryset(self):
        # Schema generation uses AnonymousUser — return empty queryset
        if not self.request.user.is_authenticated:
            return SideEffectReport.objects.none()

        user = self.request.user

        if user.is_superuser:
            return SideEffectReport.objects.all()

        if user.role in ["ADMIN", "DOCTOR"]:
            if user.hospital_id:
                return SideEffectReport.objects.filter(
                    patient__user__hospital=user.hospital
                )
            return SideEffectReport.objects.none()

        return SideEffectReport.objects.filter(
            patient__user=user
        )
