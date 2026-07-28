from rest_framework import generics
from ..models import Medication
from ..serializers import MedicationSerializer
from accounts.permissions import *
from rest_framework.permissions import IsAuthenticated

class MedicationListCreateView(generics.ListCreateAPIView):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permissions = [IsAuthenticated, IsDoctorOrAdmin]

class MedicationDetailView(generics.RetrieveUpdateDestroyAPIView):    
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permissions = [IsAuthenticated, IsDoctorOrAdmin]