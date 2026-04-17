from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.conf import settings

# Import our Serializers
from .serializers import (
    RegisterInputSerializer, VerifyEmailInputSerializer,
    LoginInputSerializer, PasswordResetRequestInputSerializer,
    PasswordResetConfirmInputSerializer, GoogleLoginInputSerializer,
    UserOutputSerializer, GoogleLoginOutputSerializer
)

# Import our Services
from modules.authentication.services import user_service, auth_service, google_auth_service

# SECURITY HELPER
def set_jwt_cookies(response: Response, access_token: str, refresh_token: str) -> Response:
    """
    Attaches JWTs to the response as secure, HttpOnly cookies.
    This prevents XSS attacks from stealing the tokens via JavaScript.
    """
    # In production, settings.DEBUG is False, making cookies HTTPS-only
    is_secure = not settings.DEBUG 
    
    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,
        secure=is_secure,
        samesite='Lax',
        max_age=3600 # 1 hour
    )
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=is_secure,
        samesite='Lax',
        max_age=86400 * 7 # 7 days
    )
    return response

# API ENDPOINTS

class RegisterAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RegisterInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = user_service.register_user(**serializer.validated_data)
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_400_BAD_REQUEST)

        output = UserOutputSerializer(user)
        return Response(output.data, status=status.HTTP_201_CREATED)


class VerifyEmailAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = VerifyEmailInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_service.verify_email(**serializer.validated_data)
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Email successfully verified."}, status=status.HTTP_200_OK)


class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            auth_data = auth_service.login_with_email(**serializer.validated_data)
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_401_UNAUTHORIZED)

        output = UserOutputSerializer(auth_data['user'])
        response = Response(output.data, status=status.HTTP_200_OK)
        
        return set_jwt_cookies(response, auth_data['access_token'], auth_data['refresh_token'])


class GoogleLoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = GoogleLoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            auth_data = google_auth_service.verify_google_token_and_login(**serializer.validated_data)
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_401_UNAUTHORIZED)

        output = GoogleLoginOutputSerializer({
            "user": auth_data['user'],
            "is_new_user": auth_data['is_new_user']
        })
        response = Response(output.data, status=status.HTTP_200_OK)
        
        return set_jwt_cookies(response, auth_data['access_token'], auth_data['refresh_token'])


class PasswordResetRequestAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetRequestInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Fails silently if email doesn't exist (handled in service)
        auth_service.request_password_reset(**serializer.validated_data)
        
        return Response(
            {"message": "If an account with that email exists, a reset link has been sent."}, 
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            auth_service.confirm_password_reset(**serializer.validated_data)
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Password successfully reset."}, status=status.HTTP_200_OK)


class LogoutAPIView(APIView):
    """
    Clears the HttpOnly cookies to log the user out.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        response = Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response