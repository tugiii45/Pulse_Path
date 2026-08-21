from rest_framework import generics
from ..models import Treatment
from ..serializers import TreatmentSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import *
from accounts.views.mixins import HospitalQuerySetMixin


class TreatmentListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    serializer_class = TreatmentSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    hospital_field = "prescription__diagnosis__visit__patient__user__hospital"
    doctor_field = "prescription__diagnosis__visit__doctor__user"
    patient_field = "prescription__diagnosis__visit__patient__user"


class TreatmentDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Treatment.objects.all()
    serializer_class = TreatmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
    hospital_field = "prescription__diagnosis__visit__patient__user__hospital"
    doctor_field = "prescription__diagnosis__visit__doctor__user"
    patient_field = "prescription__diagnosis__visit__patient__user"
