from rest_framework import serializers
from ..models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'created_by', 'title', 'message', 'notification_type', 'is_read', 'created_at']
        read_only_fields = ['id','created_by', 'created_at']