from rest_framework import generics
from ..models import Treatment
from ..serializers import TreatmentSerializer
from rest_framework.permissions import IsAuthenticated

class TreatmentListCreateView(generics.ListCreateAPIView):
    serializer_class = TreatmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "patient"):
            return Treatment.objects.filter(visit__patient=user.patient)

        return Treatment.objects.all()