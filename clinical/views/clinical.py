from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from ..models import ClinicalRecord
from ..serializers import ClinicalRecordSerializer

class ClinicalRecordListCreateView(generics.ListCreateAPIView):
    queryset = ClinicalRecord.objects.all()
    serializer_class = ClinicalRecordSerializer
    permission_classes = [IsAuthenticated]

class ClinicalRecordDetailView(generics.RetrieveUpdateDestroyAPIView):    
    queryset = ClinicalRecord.objects.all()
    serializer_class = ClinicalRecordSerializer
    permission_classes = [IsAuthenticated]