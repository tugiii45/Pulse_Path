from rest_framework import generics, permissions
from ..models import Visit
from ..serializers import VisitSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import *
from accounts.views.mixins import HospitalQuerySetMixin

class VisitListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    serializer_class = VisitSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    def get_queryset(self):
        user = self.request.user

        # Superusers see everything
        if user.is_superuser:
            return Visit.objects.all()

        if user.is_authenticated and hasattr(user, "patient"):
            return Visit.objects.filter(patient=user.patient)

        # For admin/doctor, filter by hospital
        if user.hospital_id:
            return Visit.objects.filter(patient__user__hospital=user.hospital)

        return Visit.objects.none()

    def perform_create(self, serializer):
       appointment = serializer.validated_data["appointment"]

       serializer.save(
       patient=appointment.patient
    )
    
class VisitDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer      
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
