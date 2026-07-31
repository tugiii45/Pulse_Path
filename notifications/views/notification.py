from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from ..models import *
from ..serializers import *
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin
# Create your views here.

# The NotificationListCreateView

#  class is a subclass of generics.ListCreateAPIView 
# and is used to handle the retrieval and creation of notifications.
# It applies the HospitalQuerySetMixin mixin to filter the queryset based on the user's hospital.
# The view allows filtering, searching, and ordering of notifications based on various fields. 
# The perform_create method is overridden to set the created_by field of the newly created notification to the current user.

class NotificationListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    filter_backends=[DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["notification_type", "is_read", "recipient", "created_by",]
    search_fields = ["title", "message",]
    ordering_fields = ["created_at",]
    ordering = ["-created_at"]
 
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    

    def get_queryset(self):
      if getattr(self, "swagger_fake_view", False):
        return Notification.objects.none()

    #   The get_queryset method is overridden to determine the queryset based on the user's role and hospital.'
    #   ' If the user is a superuser, it returns all notifications. '
    #   'If the user is an admin, it returns notifications where the recipient or creator is from the user's hospital. 
    #   If the user is a doctor, it returns notifications created by the user. Otherwise, it returns notifications where the recipient is the user.

      user = self.request.user

      if user.is_superuser:
        return Notification.objects.all()

      if user.role == "ADMIN":
        return Notification.objects.filter(
            recipient__hospital=user.hospital
        ) | Notification.objects.filter(
            created_by__hospital=user.hospital
        )

      if user.role == "DOCTOR":
        return Notification.objects.filter(created_by=user)

      return Notification.objects.filter(recipient=user)
    permission_classes = [IsOwnerOrDoctor]


class NotificationDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsOwnerOrDoctor]

    # The NotificationDetailView class is a subclass of generics.RetrieveUpdateDestroyAPIView and is used to handle the retrieval, updating, and deletion of individual notifications.
    #  It also applies the HospitalQuerySetMixin mixin to filter the queryset based on the user's hospital.
    #  The view requires the user to have the IsOwnerOrDoctor permission to access the notification.

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Notification.objects.all()

        if user.role == "ADMIN":
            return Notification.objects.filter(
                recipient__hospital=user.hospital
            ) | Notification.objects.filter(
                created_by__hospital=user.hospital
            )

        if user.role == "DOCTOR":
            return Notification.objects.filter(created_by=user)

        return Notification.objects.filter(recipient=user)
