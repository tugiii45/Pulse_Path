from rest_framework import generics
from ..models import Medication
from ..serializers import MedicationSerializer

class MedicationListCreateView(generics.ListCreateAPIView):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer

class MedicationDetailView(generics.RetrieveUpdateDestroyAPIView):    
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer