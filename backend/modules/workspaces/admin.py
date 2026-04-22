from django.contrib import admin
from .models import Workspace

@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('workspace_name', 'user', 'category', 'created_at', 'updated_at')
    list_filter = ('category', 'created_at')
    search_fields = ('workspace_name', 'user__email', 'user__first_name', 'user__last_name', 'custom_category')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)

    fieldsets = (
        ('Identity', {
            'fields': ('id', 'user', 'workspace_name', 'category', 'custom_category')
        }),
        ('Brand Details', {
            'fields': ('tone_of_voice', 'primary_colors', 'logo_url', 'website_url')
        }),
        ('Contact Info', {
            'fields': ('contact_email', 'phone_number', 'physical_address')
        }),
        ('AI Persona', {
            'fields': ('target_audience', 'brand_guidelines')
        }),
        ('Extra Options', {
            'fields': ('dynamic_fields',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
