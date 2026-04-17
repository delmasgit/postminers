from django.urls import path
from .api.views import WorkspaceOnboardingAPIView, WorkspaceListAPIView, WorkspaceDetailAPIView

urlpatterns = [
    path('onboarding/', WorkspaceOnboardingAPIView.as_view(), name='workspace_onboarding'),
    path('', WorkspaceListAPIView.as_view(), name='workspace_list'),
    path('<int:pk>/', WorkspaceDetailAPIView.as_view(), name='workspace_detail'),
]
