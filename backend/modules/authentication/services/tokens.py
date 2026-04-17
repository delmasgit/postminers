from django.contrib.auth.tokens import PasswordResetTokenGenerator

class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """
    Creates a unique, stateless token for email verification.
    The token will automatically become invalid once user.is_email_verified becomes True.
    """
    def _make_hash_value(self, user, timestamp):
        # We hash the user's primary key, their current verification status, and the timestamp.
        # If the status changes to True, the hash changes, and the token is permanently destroyed.
        return f"{user.pk}{user.is_email_verified}{timestamp}"

email_verification_token = EmailVerificationTokenGenerator()