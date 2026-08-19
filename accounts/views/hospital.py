"""
Hospital API views for PulsePath.

Provides list, create, retrieve, update, and delete endpoints for
hospitals. These endpoints are restricted to superusers only since
hospital management is a platform-level operation.
"""

from rest_framework import generics
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from accounts.models import Hospital
from accounts.permissions import IsSuperAdmin


class HospitalSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and exposing hospital information.

    Exposes all fields of the Hospital model as read/write, with
    only the id and created_at fields set as read-only since they
    are system-generated.
    """

    class Meta:
        model = Hospital
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class HospitalListCreateView(generics.ListCreateAPIView):
    """
    Lists active hospitals for authenticated users.

    Hospital creation remains restricted to superadmins.
    """

    queryset = Hospital.objects.filter(is_active=True)
    serializer_class = HospitalSerializer

    def get_permissions(self):
        """
        Allow authenticated users to view hospitals.

        Only superadmins can create hospitals.
        """
        if self.request.method == "POST":
            return [
                IsAuthenticated(),
                IsSuperAdmin(),
            ]

        return [IsAuthenticated()]


class HospitalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Allows authenticated users to view hospital details.

    Only superadmins can modify or delete hospitals.
    """

    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer

    def get_permissions(self):
        """
        Allow authenticated users to retrieve a hospital.

        PUT, PATCH, and DELETE remain restricted to superadmins.
        """
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [
                IsAuthenticated(),
                IsSuperAdmin(),
            ]

        return [IsAuthenticated()]

