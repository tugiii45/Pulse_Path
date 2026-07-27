from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import Diagnosis
from ..serializers.diagnosis import DiagnosisSerializer

class DiagnosisListCreateView(generics.ListCreateAPIView):
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer
    permission_classes = [IsAuthenticated]

class DiagnosisDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer
    permission_classes = [IsAuthenticated]    