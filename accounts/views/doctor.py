from rest_framework import generics, filters

from accounts.models import Doctor
from accounts.serializers import DoctorSerializer
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend



class DoctorListCreateView(generics.ListCreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = ["department", "specialization", "years_of_experience",]

    search_fields = ["specialization", "user__first_name", "user__last_name", "license_number",]

    ordering_fields = ["created_at", "years_of_experience",]

    ordering = ["-created_at"]



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