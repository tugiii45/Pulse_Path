from rest_framework import generics, filters
from ..models import RecoveryProgress
from accounts.permissions import *
from treatment.serializers import RecoveryProgressSerializer
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin
from notifications.services import create_notification
from notifications.models import Notification


class RecoveryProgressListCreateView(
    HospitalQuerySetMixin,
    generics.ListCreateAPIView
):
    serializer_class = RecoveryProgressSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    filterset_fields = ["patient", "visit"]

    search_fields = [
        "notes",
        "patient__user__first_name",
        "patient__user__last_name"
    ]

    ordering_fields = [
        "recorded_at",
        "pain_level",
        "improvement_percentage"
    ]

    ordering = ["-recorded_at"]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return RecoveryProgress.objects.none()

        user = self.request.user

        if user.is_superuser:
            return RecoveryProgress.objects.all()

        if user.role in ["ADMIN", "DOCTOR"]:
            if user.hospital_id:
                return RecoveryProgress.objects.filter(
                    patient__user__hospital=user.hospital
                )

            return RecoveryProgress.objects.all()

        return RecoveryProgress.objects.filter(
            patient__user=user
        )

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsPatient]
        else:
            permission_classes = [IsDoctorOrAdminOrPatientOwner]

        return [permission() for permission in permission_classes]

    
    def perform_create(self, serializer):
                user = self.request.user
    
                if user.role == "PATIENT":
                    recovery = serializer.save(patient=user.patient)
    
                    if recovery.visit and recovery.visit.doctor:
                        doctor_user = recovery.visit.doctor.user
    
                        create_notification(
                           recipient=doctor_user,
                           created_by=user,
                           title="New Recovery Update",
                           message=(
                                f"{user.get_full_name()} has submitted a new "
                                f"recovery update with "
                                f"{recovery.improvement_percentage}% improvement."
                            ),
                            notification_type=Notification.NotificationType.RECOVERY,
                            notification_key=f"recovery-created-{recovery.id}",
                )
    
    


class RecoveryProgressDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
        serializer_class = RecoveryProgressSerializer        
        permission_classes = [IsDoctorOrAdminOrPatientOwner]

        def get_queryset(self):
            # Schema generation uses AnonymousUser — return empty queryset
            if not self.request.user.is_authenticated:
                return RecoveryProgress.objects.none()

            user = self.request.user

            if user.is_superuser:
                return RecoveryProgress.objects.all()

            if user.role in ["ADMIN", "DOCTOR"]:
                if user.hospital_id:
                    return RecoveryProgress.objects.filter(patient__user__hospital=user.hospital)
                return RecoveryProgress.objects.all()

            return RecoveryProgress.objects.filter(patient__user=user)

        def perform_update(self, serializer):
           recovery = serializer.save()

           patient_user = recovery.patient.user

           create_notification(
              recipient=patient_user,
              created_by=self.request.user,
              title="Recovery Update",
              message=(
                f"Your recovery progress has been updated. "
                f"Current improvement: "
                f"{recovery.improvement_percentage}%."
        ),
              notification_type=Notification.NotificationType.RECOVERY,
              notification_key=(
                f"recovery-updated-{recovery.id}-"
                f"{recovery.updated_at.timestamp()}"
        ),
    )


        
        