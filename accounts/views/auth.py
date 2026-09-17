"""
Auth API views for PulsePath.

Handles user registration (open to everyone) and profile retrieval
(restricted to authenticated users). Registration uses the custom
RegisterSerializer which hashes passwords, and profile retrieval
uses the ProfileSerializer to expose user details.

NOTE: The "set password" flow for admin-invited doctor accounts
lives in accounts/views/doctor_provisioning.py (SetPasswordView),
wired to the /set-password/ route in accounts/urls.py. A duplicate,
broken SetDoctorPasswordView (referencing a SetDoctorPasswordSerializer
that no longer exists) was removed from this file -- it was dead code
left over from an earlier, abandoned attempt at the same feature.
"""

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers import (
    ProfileSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
)
from ..models import CustomUser
from ..serializers.password_reset import password_reset_token_generator
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema


class RegisterView(APIView):
    """
    Public endpoint for creating new user accounts.

    Accepts user registration data, validates it via RegisterSerializer,
    and returns the created user object with a 201 status code.
    This endpoint is open to anyone (AllowAny permission).
    """

    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: RegisterSerializer})
    def post(self, request):
        """
        Handle user registration.

        Deserializes the request body, validates the input, creates
        a new user account with a hashed password, and returns the
        created user data.
        """
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = CustomUser.objects.filter(
            email__iexact=serializer.validated_data["email"],
            is_active=True,
        ).first()

        if user:
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = password_reset_token_generator.make_token(user)
            link = (
                f"{settings.FRONTEND_BASE_URL}/reset-password/"
                f"{uidb64}/{token}/"
            )
            display_name = user.get_full_name() or user.email
            text_body = (
                f"Hello {display_name},\n\n"
                "Use the link below to reset your PulsePath password:\n\n"
                f"{link}\n\n"
                "This link expires after a limited time. If you did not "
                "request this, you can ignore this email.\n\n"
                "-- PulsePath"
            )
            html_body = (
                f"<p>Hello {display_name},</p>"
                "<p>Use the link below to reset your PulsePath password.</p>"
                f'<p><a href="{link}">Reset your password</a></p>'
                "<p>This link expires after a limited time. If you did not "
                "request this, you can ignore this email.</p>"
                "<p>-- PulsePath</p>"
            )
            email = EmailMultiAlternatives(
                subject="Reset your PulsePath password",
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            email.attach_alternative(html_body, "text/html")
            email.send(fail_silently=False)

        return Response(
            {"detail": "If an account exists for that email, a password reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Password reset successfully. You can now log in."},
            status=status.HTTP_200_OK,
        )