from django.urls import path
from .views import (
    DesignListView, 
    EditDesignView, 
    SaveDesignView, 
    DesignDetailView,
    ImageUploadView
)

urlpatterns = [
    # List all designs
    path('content-editor-studio/',              DesignListView.as_view(),   name='design-list'),
    path('content-editor-studio/upload/',       ImageUploadView.as_view(),  name='design-upload'),

    # Render image from elements
    path('content-editor-studio/edit/',         EditDesignView.as_view(),   name='design-edit'),

    # Save JSON draft only (no render)
    path('content-editor-studio/save/',         SaveDesignView.as_view(),   name='design-save'),

    # Get single design / Delete design
    path('content-editor-studio/<uuid:pk>/',    DesignDetailView.as_view(), name='design-detail'),
]