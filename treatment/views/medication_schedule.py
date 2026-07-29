from rest_framework import generics, filters
from treatment.serializers import MedicationScheduleSerializer
from treatment.models import MedicationSchedule
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend


class MedicationScheduleListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicationScheduleSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["prescription", "is_active", "prescription__diagnosis__visit__patient"]
    search_fields = ["prescription__medication__name", "prescription__medication__generic_name"]
    ordering_fields = ["start_date", "end_date", "scheduled_time", "created_at"]
    ordering = ["start_date"]

    def get_queryset(self):
        queryset = MedicationSchedule.objects.all()
        if self.request.query_params.get("is_active") is None and not self.request.query_params.get("all"):
            queryset = queryset.filter(is_active=True)
        return queryset


class MedicationScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MedicationSchedule.objects.all()
    serializer_class = MedicationScheduleSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]