import os
from .base import *

# 1. SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# 2. Allowed Hosts
# Includes your actual domain and the local proxy address OpenLiteSpeed uses
ALLOWED_HOSTS = ['postminers.com', 'www.postminers.com', '127.0.0.1', 'localhost']

# 3. Security & Proxy Settings
# OpenLiteSpeed handles the SSL certificate, so we must tell Django to trust the proxy
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Enforce secure cookies (Requires HTTPS)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# 4. CSRF Trusted Origins
# MANDATORY for the Django Admin and POST requests to work behind a proxy
CSRF_TRUSTED_ORIGINS = [
    'https://postminers.com',
    'https://www.postminers.com',
]

# 5. CORS Settings
# Since frontend and backend share a domain via path routing, they are technically same-origin. 
# However, if your frontend makes absolute URL calls, this ensures it works.
CORS_ALLOWED_ORIGINS = [
    "https://postminers.com",
    "https://www.postminers.com",
]
CORS_ALLOW_CREDENTIALS = True

# 6. Static Files (WhiteNoise)
# Define where collectstatic will put the files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Use WhiteNoise to serve compressed and cached static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Insert WhiteNoise Middleware right after SecurityMiddleware
if 'whitenoise.middleware.WhiteNoiseMiddleware' not in MIDDLEWARE:
    try:
        security_index = MIDDLEWARE.index('django.middleware.security.SecurityMiddleware')
        MIDDLEWARE.insert(security_index + 1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    except ValueError:
        # Fallback if SecurityMiddleware isn't found for some reason
        MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')