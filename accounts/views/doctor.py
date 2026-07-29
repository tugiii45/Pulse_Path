from rest_framework import generics

from accounts.models import Doctor
from accounts.serializers import DoctorSerializer
from accounts.permissions import *


class DoctorListCreateView(generics.ListCreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            permission_classes = [IsDoctorOrAdmin]
        else:
            permission_classes = []

        return [permission() for permission in permission_classes]


class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsDoctorOrAdmin]