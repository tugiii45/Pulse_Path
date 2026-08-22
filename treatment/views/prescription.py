from rest_framework import generics, filters
from ..models import Prescription
from ..serializers import PrescriptionSerializer
from accounts.permissions import *
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin


class PrescriptionListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["diagnosis", "diagnosis__visit__patient", "medication"]
    search_fields = ["instructions", "medication__name", "medication__generic_name", "dosage"]
    ordering_fields = ["prescribed_at", "duration"]
    ordering = ["-prescribed_at"]

    hospital_field = "diagnosis__visit__patient__user__hospital"
    doctor_field = "diagnosis__visit__appointment__doctor__user"
    patient_field = "diagnosis__visit__patient__user"


class PrescriptionDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
    hospital_field = "diagnosis__visit__patient__user__hospital"
    doctor_field = "diagnosis__visit__doctor__user"
    patient_field = "diagnosis__visit__patient__user"