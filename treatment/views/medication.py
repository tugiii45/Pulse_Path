from rest_framework import generics
from ..models import *
from ..serializers import *
from accounts.permissions import *
from rest_framework.permissions import IsAuthenticated
from accounts.views.mixins import HospitalQuerySetMixin

class MedicationListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]


class MedicationDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]

class HospitalMedicationListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = HospitalMedication.objects.all()
    serializer_class = HospitalMedicationSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]

    hospital_field = "hospital"


class HospitalMedicationDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = HospitalMedication.objects.all()
    serializer_class = HospitalMedicationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]

    hospital_field = "hospital"