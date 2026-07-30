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

    def get_queryset(self):
        # Schema generation uses AnonymousUser — return empty queryset
        if not self.request.user.is_authenticated:
            return Treatment.objects.none()

        user = self.request.user

        if user.is_superuser:
            return Treatment.objects.all()

        if hasattr(user, "patient"):
            return Treatment.objects.filter(prescription__diagnosis__visit__patient=user.patient)

        if user.hospital_id:
            return Treatment.objects.filter(
                prescription__diagnosis__visit__patient__user__hospital=user.hospital
            )

        return Treatment.objects.none()


class TreatmentDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Treatment.objects.all()
    serializer_class = TreatmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
    hospital_field = "prescription__diagnosis__visit__patient__user__hospital"
