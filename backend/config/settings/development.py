from .base import *

# Override base settings for local dev
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# django-environ setup here later

# Whitelist your Next.js frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

# This is MANDATORY for HttpOnly cookies to be sent back and forth
CORS_ALLOW_CREDENTIALS = True