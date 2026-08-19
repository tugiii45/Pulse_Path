from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework import serializers


class SetDoctorPasswordSerializer(serializers.Serializer):
    """
    Allows an invited doctor to set their password using a valid
    Django password-reset token.
    """

    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        User = get_user_model()

        try:
            user = User.objects.get(pk=attrs["uid"])
        except (User.DoesNotExist, ValueError):
            raise serializers.ValidationError(
                {"token": "Invalid invitation link."}
            )

        if user.role != User.Role.DOCTOR:
            raise serializers.ValidationError(
                {"token": "This invitation is not valid for a doctor account."}
            )

        if not default_token_generator.check_token(
            user,
            attrs["token"],
        ):
            raise serializers.ValidationError(
                {"token": "This invitation link is invalid or has expired."}
            )

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        self.user = user

        return attrs

    def save(self, **kwargs):
        password = self.validated_data["password"]

        self.user.set_password(password)
        self.user.save(update_fields=["password"])

        return self.user