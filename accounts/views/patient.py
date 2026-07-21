from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.models import Patient
from accounts.serializers import PatientSerializer

class PatientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Patient.objects.get(user=self.request.user)
