import resend
import logging
from django.conf import settings
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

# Initialize the Resend client with your API key from Django settings
resend.api_key = settings.RESEND_API_KEY

def _send_transactional_email(*, to_email: str, subject: str, template_name: str, context: dict) -> bool:
    """
    Internal base function to render a Django HTML template and dispatch it via Resend.
    """
    try:
        # 1. Render the HTML using Django's template engine
        html_content = render_to_string(template_name, context)
        
        # 2. Get the email, and strip any accidental whitespace
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'onboarding@resend.dev     ').strip()
        
        # Safety check: If Django somehow still injects localhost, force the Resend test email
        if 'localhost' in from_email:
            from_email = 'onboarding@resend.dev'

        params = {
            "from": f"PostMiner <{from_email}>", # Updated to your actual app name!
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }

        # 3. Fire the email synchronously
        response = resend.Emails.send(params)
        logger.info(f"Email dispatched to {to_email}. Resend ID: {response.get('id')}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

# ==========================================
# PUBLIC DISPATCHERS (Used by other modules)
# ==========================================

def dispatch_verification_email(*, email: str, first_name: str, verification_link: str) -> None:
    """
    Renders and sends the welcome/verification email.
    """
    _send_transactional_email(
        to_email=email,
        subject="Verify your email - Postminers",
        template_name="notifications/verify_email.html",
        context={
            "first_name": first_name,
            "verification_link": verification_link
        }
    )

def dispatch_password_reset_email(*, email: str, first_name: str, reset_link: str) -> None:
    """
    Renders and sends the password reset email.
    """
    _send_transactional_email(
        to_email=email,
        subject="Reset your password - Postminers",
        template_name="notifications/password_reset.html",
        context={
            "first_name": first_name,
            "reset_link": reset_link
        }
    )