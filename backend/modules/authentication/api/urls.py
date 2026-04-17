from django.urls import path
from . import views

# Setting an app_name provides a namespace for reversing URLs later
app_name = 'authentication'

urlpatterns = [
    # Registration & Verification
    path('register/', views.RegisterAPIView.as_view(), name='register'),
    path('verify-email/', views.VerifyEmailAPIView.as_view(), name='verify-email'),

    # Login & Logout
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path('login/google/', views.GoogleLoginAPIView.as_view(), name='google-login'),
    path('logout/', views.LogoutAPIView.as_view(), name='logout'),

    # Password Management
    path('password-reset/', views.PasswordResetRequestAPIView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', views.PasswordResetConfirmAPIView.as_view(), name='password-reset-confirm'),
]