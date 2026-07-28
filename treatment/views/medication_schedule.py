from rest_framework import generics
from treatment.serializers import MedicationScheduleSerializer
from treatment.models import MedicationSchedule
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import *

class MedicationScheduleListCreateView(generics.ListCreateAPIView):
    queryset = MedicationSchedule.objects.all()
    serializer_class = MedicationScheduleSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]


class MedicationScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MedicationSchedule.objects.all()
    serializer_class = MedicationScheduleSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]