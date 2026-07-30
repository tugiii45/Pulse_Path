from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated

from treatment.models import MedicationLog
from treatment.serializers import MedicationLogSerializer
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin


class MedicationLogListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = MedicationLog.objects.all()
    serializer_class = MedicationLogSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["medication_schedule", "status"]
    search_fields = ["notes", "status"]
    ordering_fields = ["taken_at", "status"]
    ordering = ["-taken_at"]

    hospital_field = "medication_schedule__prescription__diagnosis__visit__patient__user__hospital"

class MedicationLogDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = MedicationLog.objects.all()
    serializer_class = MedicationLogSerializer    
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
    hospital_field = "medication_schedule__prescription__diagnosis__visit__patient__user__hospital"
