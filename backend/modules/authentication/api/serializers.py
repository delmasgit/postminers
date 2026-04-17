from rest_framework import serializers

# INPUT SERIALIZERS (Validating Frontend JSON)

class RegisterInputSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)


class VerifyEmailInputSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    token = serializers.CharField()


class LoginInputSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class PasswordResetRequestInputSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmInputSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)


class GoogleLoginInputSerializer(serializers.Serializer):
    # This is the encrypted ID Token string provided by Google to Next.js
    token = serializers.CharField()


# OUTPUT SERIALIZERS (Formatting API Responses)

class UserOutputSerializer(serializers.Serializer):
    """
    Standard format for sending user data to the frontend.
    Note: We do NOT include the JWT tokens here because we are sending 
    them securely via HttpOnly cookies in the view!
    """
    id = serializers.IntegerField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    is_email_verified = serializers.BooleanField()
    created_at = serializers.DateTimeField()


class GoogleLoginOutputSerializer(serializers.Serializer):
    """
    Specific output for Google Auth so the frontend knows if it needs 
    to show a "Welcome" onboarding screen to a brand new user.
    """
    user = UserOutputSerializer()
    is_new_user = serializers.BooleanField()