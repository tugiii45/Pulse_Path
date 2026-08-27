from rest_framework import generics
from ..models import SideEffectReport
from ..serializers import SideEffectReportSerializer
from accounts.permissions import *
from rest_framework.permissions import IsAuthenticated
from accounts.views.mixins import HospitalQuerySetMixin
from notifications.services import create_notification
from notifications.models import Notification


class SideEffectReportListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = SideEffectReport.objects.all()
    serializer_class = SideEffectReportSerializer

    hospital_field = "prescription__diagnosis__visit__appointment__hospital"
    doctor_field = "prescription__diagnosis__visit__appointment__doctor__user"
    patient_field = "patient__user"

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsPatient]
        else:
            permission_classes = [IsDoctorOrAdminOrPatientOwner]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        report = serializer.save()

        visit = report.prescription.diagnosis.visit

        # A visit isn't guaranteed to have a confirmed appointment,
        # so guard against None before reaching for the doctor.
        if visit.appointment and visit.appointment.doctor:
            doctor = visit.appointment.doctor.user

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
    queryset = SideEffectReport.objects.all()
    serializer_class = SideEffectReportSerializer
    permission_classes = [IsDoctorOrAdminOrPatientOwner]

    hospital_field = "prescription__diagnosis__visit__appointment__hospital"
    doctor_field = "prescription__diagnosis__visit__appointment__doctor__user"
    patient_field = "patient__user"