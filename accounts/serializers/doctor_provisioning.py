"""
Doctor account-provisioning serializers for PulsePath.

Split from the existing DoctorSerializer (accounts/serializers/doctor.py)
intentionally: that serializer edits a Doctor profile for an ALREADY
authenticated user (it auto-assigns request.user). Admin-created
doctors don't exist as users yet -- this serializer creates the
CustomUser AND the Doctor profile together, with no usable password,
then relies on accounts.invites to email a "set your password" link.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers

from ..models import Doctor, Department
from ..invites import invite_token_generator

CustomUser = get_user_model()


class AdminCreateDoctorSerializer(serializers.ModelSerializer):
    """
    Admin-only: create a new DOCTOR user account plus their Doctor
    profile in one request. No password is collected here -- the
    account is created inactive-until-activated (unusable password),
    and the doctor sets their own password via the emailed invite
    link (see SetPasswordSerializer / SetPasswordView).

    email/first_name/last_name/phone_number are write_only: they're
    real fields on CustomUser, not on Doctor, so they can't be read
    back off the Doctor instance during response serialization (doing
    so raises AttributeError). to_representation() below adds them
    back into the output explicitly, sourced from doctor.user.
    """

    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(
        required=False, allow_blank=True, write_only=True
    )

    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all()
    )
    specialization = serializers.CharField()
    license_number = serializers.CharField()
    years_of_experience = serializers.IntegerField(required=False, default=0)

    class Meta:
        model = Doctor
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "department",
            "specialization",
            "license_number",
            "years_of_experience",
        ]

    def to_representation(self, instance):
        """
        Build the response using the created Doctor instance, pulling
        name/email/phone from the related user since those fields are
        write_only on this serializer (see class docstring).
        """
        data = super().to_representation(instance)
        user = instance.user
        data["email"] = user.email
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name
        data["full_name"] = user.get_full_name()
        data["phone_number"] = user.phone_number
        data["department_name"] = (
            instance.department.name if instance.department else None
        )
        return data

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def validate_department(self, value):
        """
        Restrict department choices to the admin's own hospital, unless
        the requester is a superuser (who may assign any department).
        Mirrors the same rule already enforced in DoctorSerializer.
        """
        request = self.context.get("request")
        if (
            request
            and not request.user.is_superuser
            and request.user.hospital_id
            and value.hospital_id != request.user.hospital_id
        ):
            raise serializers.ValidationError(
                "The selected department does not belong to your hospital."
            )
        return value

    def create(self, validated_data):
        email = validated_data.pop("email")
        first_name = validated_data.pop("first_name")
        last_name = validated_data.pop("last_name")
        phone_number = validated_data.pop("phone_number", "")

        department = validated_data.get("department")

        user = CustomUser(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            role="DOCTOR",
            # Doctors belong to the hospital of their assigned department.
            hospital=department.hospital if department else None,
            is_active=True,
        )
        # No password known yet -- unusable password until the doctor
        # completes the invite/set-password flow. They cannot log in
        # (via password auth) until then.
        user.set_unusable_password()
        user.save()

        return Doctor.objects.create(user=user, **validated_data)


class SetPasswordSerializer(serializers.Serializer):
    """
    Validates a doctor invite token and sets the account's real
    password. Public/unauthenticated -- the token itself is the
    credential proving the requester owns the emailed link.
    """

    uidb64 = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs["uidb64"]))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            raise serializers.ValidationError(
                {"detail": "This invite link is invalid."}
            )

        if not invite_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError(
                {"detail": "This invite link is invalid or has expired."}
            )

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["password"])
        user.save()
        return user