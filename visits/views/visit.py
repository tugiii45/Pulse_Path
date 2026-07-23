from rest_framework import generics, permissions
from ..models import Visit
from ..serializers import VisitSerializer


class VisitListCreateView(generics.ListCreateAPIView):
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "patient"):
            return Visit.objects.filter(patient=user.patient)

        return Visit.objects.all()

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient)

class VisitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer      
    permission_classes = [permissions.IsAuthenticated]