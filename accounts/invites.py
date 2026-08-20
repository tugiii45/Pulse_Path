"""
Account invite utilities for PulsePath.

Used when an ADMIN creates a DOCTOR account: the doctor has no usable
password yet, so we generate a signed, expiring "set your password"
link (reusing Django's built-in password-reset token machinery -- no
extra database table required) and email it to them.
"""

from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import EmailMultiAlternatives
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


class DoctorInviteTokenGenerator(PasswordResetTokenGenerator):
    """
    Same mechanism as Django's password-reset tokens, kept as a
    separate class so invite tokens and password-reset tokens can
    never be swapped for one another even though they share logic.
    """

    def _make_hash_value(self, user, timestamp):
        # Including is_active means the token is invalidated the
        # moment the doctor sets their password and the account
        # becomes active (see SetPasswordView).
        return f"{user.pk}{timestamp}{user.is_active}"


invite_token_generator = DoctorInviteTokenGenerator()


def build_invite_link(user):
    """Build the frontend "set your password" URL for a newly created doctor."""
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = invite_token_generator.make_token(user)
    return f"{settings.FRONTEND_BASE_URL}/set-password/{uidb64}/{token}/"


def send_doctor_invite_email(user):
    """
    Email a newly created doctor their account-activation link.

    Sent as HTML with a real <a href> link rather than plain text.
    Plain-text long URLs are prone to line-wrapping or truncation in
    some mobile mail clients, which corrupts the token before the
    doctor ever taps it -- an HTML hyperlink avoids that entirely.
    """
    link = build_invite_link(user)
    display_name = user.get_full_name() or user.email

    subject = "You've been added to PulsePath"

    text_body = (
        f"Hello Dr. {display_name},\n\n"
        "An administrator has created a PulsePath account for you.\n"
        "Set your password to activate your account and log in:\n\n"
        f"{link}\n\n"
        "This link expires after a limited time. If you did not expect "
        "this email, you can ignore it.\n\n"
        "-- PulsePath"
    )

    html_body = f"""
    <p>Hello Dr. {display_name},</p>
    <p>An administrator has created a PulsePath account for you.</p>
    <p><a href="{link}">Click here to set your password and activate your account</a></p>
    <p>Or copy and paste this link into your browser:<br>
    <a href="{link}">{link}</a></p>
    <p>This link expires after a limited time. If you did not expect this
    email, you can ignore it.</p>
    <p>-- PulsePath</p>
    """

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_body, "text/html")
    email.send(fail_silently=False)