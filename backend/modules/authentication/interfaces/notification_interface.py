import logging
from django.conf import settings
from modules.authentication.models import CustomUser

# Import the new public dispatchers from our notifications module
from modules.notifications.services.email_service import (
    dispatch_verification_email,
    dispatch_password_reset_email
)

logger = logging.getLogger(__name__)

def send_verification_email(*, email: str, user_id: int, token: str) -> None:
    """
    Bridge to the Notifications module.
    Constructs the frontend URL and triggers the actual email dispatch.
    """
    # Grab the user's first name for a personalized email
    try:
        user = CustomUser.objects.get(id=user_id)
        first_name = user.first_name
    except CustomUser.DoesNotExist:
        first_name = "there" # Fallback just in case

    # Construct the link (using a setting so it's easy to change in production)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    verification_link = f"{frontend_url}/verify?id={user_id}&token={token}"
    
    # Fire the email!
    dispatch_verification_email(
        email=email, 
        first_name=first_name, 
        verification_link=verification_link
    )


def send_password_reset_email(*, email: str, user_id: int, token: str) -> None:
    """
    Bridge to the Notifications module for password resets.
    """
    try:
        user = CustomUser.objects.get(id=user_id)
        first_name = user.first_name
    except CustomUser.DoesNotExist:
        first_name = "there"

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/reset-password?id={user_id}&token={token}"
    
    # Fire the email!
    dispatch_password_reset_email(
        email=email, 
        first_name=first_name, 
        reset_link=reset_link
    )