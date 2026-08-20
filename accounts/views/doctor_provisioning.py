"""
Doctor account-provisioning views for PulsePath.

- AdminCreateDoctorView: ADMIN-only. Creates a DOCTOR user + Doctor
  profile and emails them an account-activation ("set your password")
  link. Doctors never self-register.
- SetPasswordView: public. Consumes that link's token and activates
  the account by setting a real password.
"""

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from accounts.serializers.doctor_provisioning import (
    AdminCreateDoctorSerializer,
    SetPasswordSerializer,
)
from accounts.invites import send_doctor_invite_email


class AdminCreateDoctorView(generics.CreateAPIView):
    """
    ADMIN-only endpoint to create a new doctor account.

    Creates the CustomUser (role=DOCTOR, unusable password) and the
    Doctor profile together, then emails the doctor an invite link to
    set their own password and activate the account.
    """

    serializer_class = AdminCreateDoctorSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_context(self):
        return {"request": self.request}

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        doctor = serializer.save()

        try:
            send_doctor_invite_email(doctor.user)
        except Exception:
            # The account was created successfully even if the email
            # failed to send (e.g. SMTP misconfigured/down). Surface
            # this distinctly so admin knows to resend or share the
            # link manually, rather than masking it as a 500 that
            # implies the doctor wasn't created at all.
            return Response(
                {
                    "doctor": AdminCreateDoctorSerializer(
                        doctor, context={"request": request}
                    ).data,
                    "warning": (
                        "Doctor account created, but the invite email "
                        "failed to send. Please resend it manually."
                    ),
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            AdminCreateDoctorSerializer(doctor, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class SetPasswordView(APIView):
    """
    Public endpoint for a newly invited doctor to set their password
    and activate their account, using the token from their invite
    email. No authentication required -- the token is the credential.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Password set successfully. You can now log in."},
            status=status.HTTP_200_OK,
        )