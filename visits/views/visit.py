from rest_framework import generics, permissions
from ..models import Visit
from ..serializers import VisitSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import *

class VisitListCreateView(generics.ListCreateAPIView):
    serializer_class = VisitSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and hasattr(user, "patient"):
            return Visit.objects.filter(patient=user.patient)

        return Visit.objects.all()

    def perform_create(self, serializer):
       appointment = serializer.validated_data["appointment"]

       serializer.save(
       patient=appointment.patient
    )
    
class VisitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer      
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]