from rest_framework import generics, filters
from ..models import Notification
from ..serializers import NotificationSerializer
from accounts.permissions import IsOwnerOrDoctor
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin


class NotificationListCreateView(
    HospitalQuerySetMixin,
    generics.ListCreateAPIView
):
    serializer_class = NotificationSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "notification_type",
        "is_read",
        "recipient",
        "created_by",
    ]

    search_fields = [
        "title",
        "message",
    ]

    ordering_fields = [
        "created_at",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()

        user = self.request.user

        if not user.is_authenticated:
            return Notification.objects.none()

        if user.is_superuser:
            return Notification.objects.all()

        if user.role == "ADMIN":
            if not user.hospital_id:
                return Notification.objects.none()

            return Notification.objects.filter(
                recipient__hospital=user.hospital
            )

        if user.role == "DOCTOR":
            return Notification.objects.filter(
                recipient=user
            )

        if user.role == "PATIENT":
            return Notification.objects.filter(
                recipient=user
            )

        return Notification.objects.none()

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )


class NotificationDetailView(
    HospitalQuerySetMixin,
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = NotificationSerializer
    permission_classes = [IsOwnerOrDoctor]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()

        user = self.request.user

        if not user.is_authenticated:
            return Notification.objects.none()

        if user.is_superuser:
            return Notification.objects.all()

        if user.role == "ADMIN":
            if not user.hospital_id:
                return Notification.objects.none()

            return Notification.objects.filter(
                recipient__hospital=user.hospital
            )

        if user.role in ["DOCTOR", "PATIENT"]:
            return Notification.objects.filter(
                recipient=user
            )

        return Notification.objects.none()