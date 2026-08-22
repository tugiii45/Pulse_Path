"""
Admin account-provisioning serializers for PulsePath.

Mirrors accounts/serializers/doctor_provisioning.py: a SUPERADMIN
creates the CustomUser for a new hospital ADMIN with no usable
password and no hospital assigned yet. The admin activates their
account via the same "set your password" invite-link flow used for
doctors (see SetPasswordSerializer / SetPasswordView), then registers
their own hospital afterward via HospitalRegisterView, which links
CustomUser.hospital in one step.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

CustomUser = get_user_model()


class SuperAdminCreateAdminSerializer(serializers.ModelSerializer):
    """
    SUPERADMIN-only: create a new ADMIN user account.

    No password is collected here -- the account is created with an
    unusable password, and the admin sets their own password via the
    emailed invite link. No hospital is assigned at creation time;
    the admin registers their own hospital on first login.
    """

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def create(self, validated_data):
        user = CustomUser(
            role="ADMIN",
            hospital=None,
            is_active=True,
            **validated_data,
        )
        # No password known yet -- unusable password until the admin
        # completes the invite/set-password flow.
        user.set_unusable_password()
        user.save()
        return user