from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from ..models import ClinicalRecord
from ..serializers.clinical_record import ClinicalRecordSerializer
from accounts.permissions import *

class ClinicalRecordListCreateView(generics.ListCreateAPIView):
    queryset = ClinicalRecord.objects.all()
    serializer_class = ClinicalRecordSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]

class ClinicalRecordDetailView(generics.RetrieveUpdateDestroyAPIView):    
    queryset = ClinicalRecord.objects.all()
    serializer_class = ClinicalRecordSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]