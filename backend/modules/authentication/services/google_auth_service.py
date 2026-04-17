from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from modules.authentication.models import CustomUser

import requests as py_requests

@transaction.atomic
def verify_google_token_and_login(*, token: str) -> dict:
    """
    Verifies a Google access token, finds or creates the user, and returns JWTs.
    """
    try:
        response = py_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        if not response.ok:
            raise ValueError("Invalid token")
            
        idinfo = response.json()

    except Exception:
        # Invalid token, expired token, or network error
        raise ValidationError("Invalid or expired Google token.")

    # 3. Extract the user payload from the verified token
    email = idinfo.get('email')
    first_name = idinfo.get('given_name', '')
    last_name = idinfo.get('family_name', '')

    if not email:
        raise ValidationError("Google token did not provide an email address.")

    # 4. Find the user, or create them if they are brand new
    user_obj, created = CustomUser.objects.get_or_create(
        email=email,
        defaults={
            'first_name': first_name,
            'last_name': last_name,
            'is_email_verified': True, # Google already verified their email!
        }
    )

    if created:
        # Users created via Google OAuth shouldn't have a usable password.
        # If they ever want to log in with a password later, they can use the "Forgot Password" flow.
        user_obj.set_unusable_password()
        user_obj.save()
    elif not user_obj.is_email_verified:
        # If a user registered with email/password but never clicked the verification link,
        # logging in with Google acts as automatic proof of email ownership.
        user_obj.is_email_verified = True
        user_obj.save(update_fields=['is_email_verified'])

    # 5. Generate your backend's JWTs for the session
    refresh = RefreshToken.for_user(user_obj)

    return {
        "user": user_obj,
        "is_new_user": created, # Helpful for the frontend to show a "Welcome" onboarding modal
        "refresh_token": str(refresh),
        "access_token": str(refresh.access_token),
    }