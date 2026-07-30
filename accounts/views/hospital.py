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
    Superadmin-only endpoint for listing and creating hospitals.

    The list only returns hospitals that are still active. Creation
    requires superuser privileges to prevent unauthorized hospital
    registrations.
    """

    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class HospitalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Superadmin-only endpoint for retrieving, updating, and deactivating
    a hospital. This allows platform administrators to manage hospital
    records safely.
    """

    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

