from rest_framework import serializers
from ..models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "created_by",
            "title",
            "message",
            "notification_type",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        # Patients cannot create notifications for other users.
        if user.role == "PATIENT":
            attrs["recipient"] = user

        return attrs