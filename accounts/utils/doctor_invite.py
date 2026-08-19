from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives


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

    text_message = f"""
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

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PulsePath Doctor Invitation</title>
</head>

<body style="margin:0; padding:0; background-color:#f5f7fa; font-family:Arial, sans-serif;">

    <div style="max-width:600px; margin:40px auto; background:#ffffff;
                padding:40px; border-radius:10px;">

        <h2 style="margin-top:0; color:#212529;">
            Welcome to PulsePath
        </h2>

        <p>
            Hello <strong>{user.get_full_name()}</strong>,
        </p>

        <p>
            An administrator has created a PulsePath doctor account for you.
        </p>

        <p>
            Your PulsePath login email is:
        </p>

        <p>
            <strong>{user.email}</strong>
        </p>

        <p>
            To activate your account, please set your password using the
            button below:
        </p>

        <p style="margin:30px 0;">
            <a href="{invite_url}"
               style="
                    display:inline-block;
                    padding:12px 24px;
                    background-color:#0d6efd;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;
               ">
                Set Your Password
            </a>
        </p>

        <p style="font-size:14px; color:#6c757d;">
            This invitation link is temporary and can only be used to
            set your password.
        </p>

        <p style="font-size:14px; color:#6c757d;">
            If you did not expect this invitation, please contact your
            hospital administrator.
        </p>

        <p>
            Regards,<br>
            <strong>PulsePath</strong>
        </p>

    </div>

</body>
</html>
"""

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )

    email.attach_alternative(html_message, "text/html")

    email.send(fail_silently=False)

    return invite_url