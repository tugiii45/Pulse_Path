"""
Admin account-provisioning views for PulsePath.

- SuperAdminCreateAdminView: SUPERADMIN-only. Creates an ADMIN user
  with no hospital yet and emails them an account-activation
  ("set your password") link. Admins never self-register.
"""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsSuperAdmin
from accounts.serializers.admin_provisioning import SuperAdminCreateAdminSerializer
from accounts.invites import send_admin_invite_email


class SuperAdminCreateAdminView(generics.CreateAPIView):
    """
    SUPERADMIN-only endpoint to create a new hospital-admin account.

    Creates the CustomUser (role=ADMIN, no hospital, unusable
    password), then emails the admin an invite link to set their own
    password and activate the account. The admin registers their own
    hospital afterward (see HospitalRegisterView).
    """

    serializer_class = SuperAdminCreateAdminSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        admin_user = serializer.save()

        try:
            send_admin_invite_email(admin_user)
        except Exception:
            # The account was created successfully even if the email
            # failed to send. Surface this distinctly rather than
            # masking it as a 500 that implies the admin wasn't
            # created at all.
            return Response(
                {
                    "admin": SuperAdminCreateAdminSerializer(admin_user).data,
                    "warning": (
                        "Admin account created, but the invite email "
                        "failed to send. Please resend it manually."
                    ),
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            SuperAdminCreateAdminSerializer(admin_user).data,
            status=status.HTTP_201_CREATED,
        )