from rest_framework import generics
from ..models import Treatment
from ..serializers import TreatmentSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import *

class TreatmentListCreateView(generics.ListCreateAPIView):
    serializer_class = TreatmentSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and hasattr(user, "patient"):
            return Treatment.objects.filter(prescription__diagnosis__visit__patient=user.patient)

        return Treatment.objects.all()


class TreatmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Treatment.objects.all()
    serializer_class = TreatmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]