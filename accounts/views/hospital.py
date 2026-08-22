"""
Hospital API views for PulsePath.

Provides list, create, retrieve, update, and delete endpoints for
hospitals. Direct creation (HospitalListCreateView POST) is
restricted to superusers only, since hospital management is a
platform-level operation.

HospitalRegisterView is a separate, ADMIN-only self-service endpoint:
a superadmin-created admin (see admin_provisioning.py) has no hospital
yet, and uses this to register their own and become linked to it in
one step. A strict one admin <-> one hospital rule is enforced -- an
admin who already has a hospital cannot register a second one.
"""

from rest_framework import generics
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from accounts.models import Hospital
from accounts.permissions import IsSuperAdmin, IsAdmin


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


class HospitalRegisterSerializer(serializers.ModelSerializer):
    """
    Lets an ADMIN with no hospital yet register their own hospital.

    On save, links the new hospital to request.user in the same step
    -- no separate "assign" call is needed. Rejects the request
    outright if the admin already manages a hospital.
    """

    class Meta:
        model = Hospital
        fields = ["id", "name", "email", "phone", "address", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user

        if user.hospital_id:
            raise serializers.ValidationError(
                "You already manage a hospital and cannot register "
                "another one."
            )

        return attrs

    def create(self, validated_data):
        hospital = Hospital.objects.create(**validated_data)

        user = self.context["request"].user
        user.hospital = hospital
        user.save(update_fields=["hospital"])

        return hospital


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

        Only superadmins can create hospitals directly through this
        endpoint. Admins register their own hospital via
        HospitalRegisterView instead.
        """
        if self.request.method == "POST":
            return [
                IsAuthenticated(),
                IsSuperAdmin(),
            ]

        return [IsAuthenticated()]


class HospitalRegisterView(generics.CreateAPIView):
    """
    ADMIN-only: self-service hospital registration.

    An admin created by a superadmin (see SuperAdminCreateAdminView)
    has no hospital yet -- this lets them register one and become
    linked to it in a single request.
    """

    serializer_class = HospitalRegisterSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


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