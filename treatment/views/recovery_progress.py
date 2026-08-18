from rest_framework import generics, filters
from ..models import RecoveryProgress
from accounts.permissions import *
from treatment.serializers import RecoveryProgressSerializer
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin


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
            serializer.save(patient=user.patient)
    


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

        