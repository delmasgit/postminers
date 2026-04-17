from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

class CustomCookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class that tells SimpleJWT to look for the 
    access token inside the HttpOnly cookies, rather than expecting 
    it in the Authorization header.
    """
    def authenticate(self, request):
        # 1. Try to get the token from the cookie we set in Phase 4
        raw_token = request.COOKIES.get('access_token')

        # 2. If it's not in the cookie, fallback to standard Header check
        # (Useful if you later build a mobile app that doesn't use cookies)
        if raw_token is None:
            return super().authenticate(request)

        # 3. If the cookie exists, validate it and return the user
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token