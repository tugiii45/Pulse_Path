from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from treatment.models import MedicationLog
from treatment.serializers import MedicationLogSerializer

class MedicationLogListCreateView(generics.ListCreateAPIView):
    queryset = MedicationLog.objects.all()
    serializer_class = MedicationLogSerializer
    permission_classes = [IsAuthenticated]

class MedicationLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MedicationLog.objects.all()
    serializer_class = MedicationLogSerializer    
    permission_classes = [IsAuthenticated]