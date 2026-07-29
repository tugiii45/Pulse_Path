from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from ..models import Diagnosis
from ..serializers.diagnosis import DiagnosisSerializer
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend


class DiagnosisListCreateView(generics.ListCreateAPIView):
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["visit", "visit__patient", "status", "severity"]
    search_fields = ["condition", "notes", "icd10_code"]
    ordering_fields = ["diagnosed_at", "severity"]
    ordering = ["-diagnosed_at"]


class DiagnosisDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]