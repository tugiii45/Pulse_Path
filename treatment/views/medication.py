from rest_framework import generics
from ..models import *
from ..serializers import *
from accounts.permissions import *
from rest_framework.permissions import IsAuthenticated
from accounts.views.mixins import HospitalQuerySetMixin


class MedicationListCreateView(generics.ListCreateAPIView):
    """
    Medication is a shared, global drug catalog (name, generic name,
    manufacturer, strength, dosage form) -- it isn't scoped to a
    patient, doctor, or hospital, so it doesn't use
    HospitalQuerySetMixin. Every authenticated doctor/admin sees the
    full catalog. Per-hospital stock is tracked separately via
    HospitalMedication below.
    """
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]


class MedicationDetailView(generics.RetrieveUpdateDestroyAPIView):
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