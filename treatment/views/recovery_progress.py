from rest_framework import generics, filters
from ..models import RecoveryProgress
from accounts.permissions import *
from treatment.serializers import RecoveryProgressSerializer
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin
from notifications.services import create_notification
from notifications.models import Notification


class RecoveryProgressListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = RecoveryProgress.objects.all()
    serializer_class = RecoveryProgressSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["patient", "visit"]
    search_fields = ["notes", "patient__user__first_name", "patient__user__last_name"]
    ordering_fields = ["recorded_at", "pain_level", "improvement_percentage"]
    ordering = ["-recorded_at"]

    hospital_field = "visit__appointment__hospital"
    doctor_field = "visit__appointment__doctor__user"
    patient_field = "patient__user"

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsPatient]
        else:
            permission_classes = [IsDoctorOrAdminOrPatientOwner]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        recovery = serializer.save()

        # visit is nullable on RecoveryProgress, and a visit isn't
        # guaranteed to have a confirmed appointment — guard both.
        visit = recovery.visit
        if visit and visit.appointment and visit.appointment.doctor:
            doctor = visit.appointment.doctor.user

            create_notification(
                recipient=doctor,
                created_by=self.request.user,
                title="New Recovery Progress Update",
                message=(
                    f"{recovery.patient.user.get_full_name()} has submitted "
                    f"a new recovery progress entry "
                    f"({recovery.improvement_percentage}% improvement)."
                ),
                notification_type=Notification.NotificationType.RECOVERY,
                notification_key=f"recovery-progress-{recovery.id}",
            )


class RecoveryProgressDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = RecoveryProgress.objects.all()
    serializer_class = RecoveryProgressSerializer
    permission_classes = [IsDoctorOrAdminOrPatientOwner]

    hospital_field = "visit__appointment__hospital"
    doctor_field = "visit__appointment__doctor__user"
    patient_field = "patient__user"

    def perform_update(self, serializer):
       request_user = self.request.user

    # Capture the review state before saving.
       recovery = self.get_object()
       was_reviewed = recovery.is_reviewed

    # Save the update.
       recovery = serializer.save()

    # Notify the patient only when the entry changes
    # from not reviewed to reviewed.
       if (
         request_user.role in ["DOCTOR", "ADMIN"]
         and not was_reviewed
         and recovery.is_reviewed
    ):
         patient_user = recovery.patient.user

         reviewer_label = (
            "doctor"
            if request_user.role == "DOCTOR"
            else "hospital administrator"
        )

         create_notification(
            recipient=patient_user,
            created_by=request_user,
            title="Recovery Progress Reviewed",
            message=(
                f"Your recovery progress has been reviewed by your "
                f"{reviewer_label}."
            ),
            notification_type=Notification.NotificationType.RECOVERY,
            notification_key=f"recovery-reviewed-{recovery.id}",
        )