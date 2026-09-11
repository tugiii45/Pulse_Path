from rest_framework import generics, filters
from rest_framework.exceptions import PermissionDenied

from ..models import Notification
from ..serializers import NotificationSerializer
from accounts.permissions import IsNotificationRecipientOrStaff
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin


class NotificationListCreateView(
    HospitalQuerySetMixin,
    generics.ListCreateAPIView
):
    """
    GET  /notifications/  -> list notifications visible to the current user
    POST /notifications/  -> create a new notification (e.g. doctor/system
                              notifying a patient, or admin broadcasting)

    Note: this view has no `permission_classes` set explicitly, so it falls
    back to DRF's global default (usually IsAuthenticated). Access control
    for *which* notifications a user can see is instead handled entirely
    inside get_queryset() below.
    """

    serializer_class = NotificationSerializer

    # Enables filtering (?notification_type=..., ?is_read=...),
    # searching (?search=...) and ordering (?ordering=...) on this endpoint.
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    # Fields a client can filter on exactly, e.g. GET ?is_read=false
    filterset_fields = [
        "notification_type",
        "is_read",
        "recipient",
        "created_by",
    ]

    # Fields included in free-text search via ?search=...
    search_fields = [
        "title",
        "message",
    ]

    # Fields allowed in ?ordering=... query param
    ordering_fields = [
        "created_at",
    ]

    # Default ordering when the client doesn't specify one:
    # newest notifications first.
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Restrict the notifications returned by role, so that each user
        type only ever sees notifications relevant to them.
        """

        # Used by drf-yasg/swagger schema generation, which calls this
        # method without a real authenticated request. Avoid crashing
        # the schema generator by returning an empty queryset.
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()

        user = self.request.user

        # Defensive check: AnonymousUser has no role/hospital, so bail
        # out early instead of hitting an AttributeError below.
        if not user.is_authenticated:
            return Notification.objects.none()

        # Superusers (platform-level) can see every notification,
        # across all hospitals.
        if user.is_superuser:
            return Notification.objects.all()

        if user.role == "ADMIN":
            # Admins are scoped to their own hospital. If an admin
            # somehow has no hospital assigned, give them nothing
            # rather than accidentally leaking data.
            if not user.hospital_id:
                return Notification.objects.none()

            # Admins see notifications belonging to any patient/user
            # in their hospital, not just their own.
            return Notification.objects.filter(
                recipient__hospital=user.hospital
            )

        if user.role == "DOCTOR":
            # Doctors only see notifications addressed directly to them
            # (not their patients' notifications).
            return Notification.objects.filter(
                recipient=user
            )

        if user.role == "PATIENT":
            # Patients only ever see their own notifications.
            return Notification.objects.filter(
                recipient=user
            )

        # Any other/unrecognized role gets no notifications by default
        # (fail closed rather than fail open).
        return Notification.objects.none()

    def perform_create(self, serializer):
        # Automatically stamp the notification with whoever made the
        # POST request, so `created_by` can't be spoofed by the client.
        serializer.save(
            created_by=self.request.user
        )


class NotificationDetailView(
    HospitalQuerySetMixin,
    generics.RetrieveUpdateDestroyAPIView
):
    """
    GET    /notifications/<id>/  -> retrieve a single notification
    PATCH  /notifications/<id>/  -> partially update it (e.g. mark as read)
    PUT    /notifications/<id>/  -> full update
    DELETE /notifications/<id>/  -> delete it

    Unlike the list/create view above, this view DOES set an explicit
    permission_classes, because object-level checks (e.g. "is this
    patient's own notification?") are needed once we're dealing with a
    single object rather than a queryset.
    """

    serializer_class = NotificationSerializer

    # Doctors/admins get full access to notifications within their scope.
    # Patients get read access plus the ability to update their own
    # notification's is_read flag (see IsNotificationRecipientOrStaff
    # in accounts/permissions.py for the exact rules).
    permission_classes = [IsNotificationRecipientOrStaff]

    def get_queryset(self):
        """
        Same role-based scoping as the list view above, but for a
        single-object lookup (used by DRF to fetch the object before
        running permission checks against it).
        """

        # See comment in NotificationListCreateView.get_queryset —
        # same swagger schema-generation guard.
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

        # Doctors and patients are both restricted to notifications
        # addressed to them personally.
        if user.role in ["DOCTOR", "PATIENT"]:
            return Notification.objects.filter(
                recipient=user
            )

        return Notification.objects.none()

    def perform_update(self, serializer):
        """
        Called after permission checks pass, right before saving a
        PATCH/PUT. Used here to enforce a *field-level* restriction
        that permission_classes alone can't express: patients may only
        ever change `is_read`, never the notification's content.
        """

        user = self.request.user

        # Patients may only ever toggle is_read on their own
        # notifications — they should never be able to rewrite
        # the title, message, type, or reassign the recipient.
        if user.role == "PATIENT":
            allowed_fields = {"is_read"}
            incoming_fields = set(self.request.data.keys())

            # issubset check: every field the client sent must be in
            # the allowed set. If a patient sends anything else
            # (e.g. {"title": "..."} or {"is_read": true, "message": "x"}),
            # reject the whole request rather than silently ignoring
            # the disallowed fields.
            if not incoming_fields.issubset(allowed_fields):
                raise PermissionDenied(
                    "Patients may only update the is_read field."
                )

        # Doctors/admins (or a patient who only sent is_read) fall
        # through to a normal save.
        serializer.save()