from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import *
from ..serializers import *
from accounts.permissions import *
# Create your views here.

class NotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
 
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    

    def get_queryset(self):
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