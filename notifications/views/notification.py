from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from ..models import *
from ..serializers import *
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
# Create your views here.

class NotificationListCreateView(generics.ListCreateAPIView):
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

      user = self.request.user

      if user.role == "ADMIN":
        return Notification.objects.all()

      if user.role == "DOCTOR":
        return Notification.objects.filter(created_by=user)

      return Notification.objects.filter(recipient=user)
    permission_classes = [IsOwnerOrDoctor]


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsOwnerOrDoctor]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Notification.objects.all()

        if user.role == "DOCTOR":
            return Notification.objects.filter(created_by=user)

        return Notification.objects.filter(recepient=user)    