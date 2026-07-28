from rest_framework import generics
from ..models import Prescription
from ..serializers import PrescriptionSerializer
from accounts.permissions import *
from rest_framework.permissions import IsAuthenticated

class PrescriptionListCreateView(generics.ListCreateAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]


class PrescriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]