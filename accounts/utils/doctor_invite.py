from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail


def send_doctor_invitation(user):
    """
    Generate a secure password-reset token and send a doctor invitation email.
    """

    token = default_token_generator.make_token(user)

    frontend_url = settings.FRONTEND_BASE_URL.rstrip("/")

    invite_url = (
        f"{frontend_url}/set-password/"
        f"?uid={user.pk}&token={token}"
    )

    subject = "PulsePath Doctor Account Invitation"

    message = f"""
Hello {user.get_full_name()},

An administrator has created a PulsePath doctor account for you.

Your PulsePath login email is:

{user.email}

Please set your password using the link below:

{invite_url}

This invitation link is temporary and can only be used to set your password.

If you did not expect this invitation, please contact your hospital administrator.

Regards,
PulsePath
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return invite_url