from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from modules.authentication.models import CustomUser
from modules.authentication.interfaces.notification_interface import send_password_reset_email

def login_with_email(*, email: str, password: str) -> dict:
    """
    Validates credentials, checks verification status, and generates JWTs.
    """
    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        raise ValidationError("Invalid email or password.")

    # Securely verify the password hash
    if not user.check_password(password):
        raise ValidationError("Invalid email or password.")

    # Enforce email verification
    if not user.is_email_verified:
        raise ValidationError("Please verify your email address before logging in.")

    # Generate the JWT Access and Refresh tokens
    refresh = RefreshToken.for_user(user)
    
    return {
        "user": user,
        "refresh_token": str(refresh),
        "access_token": str(refresh.access_token),
    }


def request_password_reset(*, email: str) -> None:
    """
    Generates a password reset token if the user exists. 
    Fails silently if the user does not exist to prevent email enumeration.
    """
    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        # Security best practice: Do nothing, let the frontend show a generic "If your email exists, a link was sent" message.
        return
    
    # Generate a token that will automatically expire once the password changes
    token = default_token_generator.make_token(user)
    
    # TODO: Pass payload to the Notification Interface (Task 3.1)
    send_password_reset_email(email=user.email, user_id=user.id, token=token)
    
    # Temporary debug print
    print(f"\n--- DEBUG PASSWORD RESET ---\nTo: {user.email}\nLink: {settings.FRONTEND_URL}/reset-password?id={user.id}&token={token}\n---------------------------\n")


def confirm_password_reset(*, user_id: int, token: str, new_password: str) -> None:
    """
    Validates the reset token and safely updates the user's password.
    """
    try:
        user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        raise ValidationError("Invalid user identifier.")

    # Verify the token is mathematically valid and hasn't been used yet
    if not default_token_generator.check_token(user, token):
        raise ValidationError("The password reset link is invalid or has expired.")

    # Hash the new password and save ONLY the password field
    user.set_password(new_password)
    user.save(update_fields=['password'])
    
    # Note: If you want to force log out the user on all other devices, 
    # you would trigger a token blacklist function here.