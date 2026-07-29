from rest_framework import generics, filters
from ..models import RecoveryProgress
from accounts.permissions import *
from treatment.serializers import RecoveryProgressSerializer
from django_filters.rest_framework import DjangoFilterBackend


class RecoveryProgressListCreateView(generics.ListCreateAPIView):
    serializer_class = RecoveryProgressSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["patient", "visit"]
    search_fields = ["notes", "patient__user__first_name", "patient__user__last_name"]
    ordering_fields = ["recorded_at", "pain_level", "improvement_percentage"]
    ordering = ["-recorded_at"]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["ADMIN", "DOCTOR"]:
            return RecoveryProgress.objects.all()

        return RecoveryProgress.objects.filter(patient__user=user)

    def get_permissions(self):
        if self.request.method == 'POST':
            permission_classes = [IsPatient]

        else:
            permission_classes = [IsDoctorOrAdminOrPatientOwner]

        return [permission() for permission in permission_classes]


class RecoveryProgressDetailView(generics.RetrieveUpdateDestroyAPIView):
        serializer_class = RecoveryProgressSerializer        
        permission_classes = [IsDoctorOrAdminOrPatientOwner]

        def get_queryset(self):
            user = self.request.user

            if user.role in ["ADMIN", "DOCTOR"]:
                return RecoveryProgress.objects.all()

            return RecoveryProgress.objects.filter(patient__user=user)

        