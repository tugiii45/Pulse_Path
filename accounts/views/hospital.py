from rest_framework import generics
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from accounts.models import Hospital
from accounts.permissions import IsSuperAdmin


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class HospitalListCreateView(generics.ListCreateAPIView):
    """
    Platform superadmin-only endpoint for listing and creating hospitals.
    Only active hospitals are returned in the list.
    """
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class HospitalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Platform superadmin-only endpoint for retrieving, updating, and
    deactivating a hospital.
    """
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

