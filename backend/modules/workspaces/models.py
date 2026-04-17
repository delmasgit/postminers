from django.db import models
from django.conf import settings
from shared.models import BaseModel

class Workspace(BaseModel):
    CATEGORY_CHOICES = [
        ('ecommerce_retail', 'E-commerce & Retail'),
        ('local_business', 'Local Business'),
        ('education_coaching', 'Education & Coaching'),
        ('software_tech', 'Software & Tech'),
        ('creator_brand', 'Creator & Solopreneur'),
        ('other_custom', 'Other / Custom')
    ]

    # Let's do ForeignKey so users could have multiple workspaces in the future.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workspaces')
    workspace_name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    custom_category = models.CharField(max_length=255, blank=True, null=True)
    
    # Brand details
    tone_of_voice = models.TextField(blank=True, null=True)
    primary_colors = models.JSONField(default=list, blank=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    website_url = models.URLField(max_length=500, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    physical_address = models.TextField(blank=True, null=True)
    
    # Store dynamic fields from onboarding step 2 depending on category
    dynamic_fields = models.JSONField(default=dict, blank=True)

    # AI persona context fields (editable from the Persona page)
    target_audience = models.TextField(blank=True, null=True)
    brand_guidelines = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'workspace_workspace'
        verbose_name = 'Workspace'
        verbose_name_plural = 'Workspaces'

    def __str__(self):
        return f"{self.workspace_name} ({self.user.email})"
