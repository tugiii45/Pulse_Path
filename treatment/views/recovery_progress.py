from rest_framework import generics
from ..models import RecoveryProgress
from accounts.permissions import *
from treatment.serializers import RecoveryProgressSerializer


class RecoveryProgressListCreateView(generics.ListCreateAPIView):
    serializer_class = RecoveryProgressSerializer
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

        