from django.urls import path
from .views import GenerateDesignsView

urlpatterns = [
    path('generate/', GenerateDesignsView.as_view(), name='ai-generate'),
]
