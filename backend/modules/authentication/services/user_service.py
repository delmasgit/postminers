from django.db import transaction
from django.core.exceptions import ValidationError
from modules.authentication.models import CustomUser
from .tokens import email_verification_token
from django.conf import settings
from modules.authentication.interfaces.notification_interface import send_verification_email

@transaction.atomic
def register_user(*, email: str, password: str, first_name: str, last_name: str) -> CustomUser:
    """
    Registers a new user, or updates an unverified user so they can try verifying again.
    """
    email = email.lower().strip()
    
    # 1. Look for an existing user
    user = CustomUser.objects.filter(email=email).first()

    if user:
        # 2. If the user exists AND is already verified, block the registration
        if user.is_email_verified:
            raise ValidationError("A user with this email address already exists.")
        
        # 3. If the user exists but IS NOT verified, update their details so they can try again
        user.first_name = first_name
        user.last_name = last_name
        user.set_password(password)
        user.full_clean()
        user.save()
        
    else:
        # 4. If no user exists, create a brand new instance
        user = CustomUser(
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_email_verified=False
        )
        user.set_password(password)
        user.full_clean() 
        user.save()

    # 5. Generate the secure verification token
    token = email_verification_token.make_token(user)

    # 6. Pass payload to the Notification Interface
    send_verification_email(email=user.email, user_id=user.id, token=token)
    
    # Temporary debug print for local testing
    print(f"\n--- DEBUG EMAIL ---\nTo: {user.email}\nLink: {settings.FRONTEND_URL}/verify?id={user.id}&token={token}\n-------------------\n")

    return user

@transaction.atomic
def verify_email(*, user_id: int, token: str) -> bool:
    """
    Validates the token and activates the user's email status.
    """
    try:
        user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        raise ValidationError("Invalid user identifier.")

    if user.is_email_verified:
        raise ValidationError("This email address is already verified.")

    # Check if the token is valid, matches the user, and hasn't expired
    if not email_verification_token.check_token(user, token):
        raise ValidationError("The verification link is invalid or has expired.")

    # Mark as verified and save ONLY that specific field for performance
    user.is_email_verified = True
    user.save(update_fields=['is_email_verified'])
    
    return True