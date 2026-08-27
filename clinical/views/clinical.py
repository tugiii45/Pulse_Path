from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated

from ..models import ClinicalRecord
from ..serializers.clinical_record import ClinicalRecordSerializer
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin


class ClinicalRecordListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = ClinicalRecord.objects.all()
    serializer_class = ClinicalRecordSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["visit", "visit__patient"]
    search_fields = ["medical_notes", "allergies", "chronic_conditions", "current_medications"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    hospital_field = "visit__appointment__hospital"
    doctor_field = "visit__appointment__doctor__user"
    patient_field = "visit__patient__user"


class ClinicalRecordDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = ClinicalRecord.objects.all()
    serializer_class = ClinicalRecordSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
    hospital_field = "visit__appointment__hospital"
    doctor_field = "visit__appointment__doctor__user"
    patient_field = "visit__patient__user"
