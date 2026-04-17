from django.contrib import admin
from .models import Design, DesignElement


@admin.register(Design)
class DesignAdmin(admin.ModelAdmin):
    list_display  = ('id', 'canvas_width', 'canvas_height', 'elements_count', 'created_at', 'updated_at')
    list_filter   = ('created_at',)
    search_fields = ('id', 'background_url')
    readonly_fields = ('id', 'created_at', 'updated_at', 'elements_count')
    ordering      = ('-created_at',)

    fieldsets = (
        ('Identity', {
            'fields': ('id',)
        }),
        ('Canvas', {
            'fields': ('background_url', 'canvas_width', 'canvas_height')
        }),
        ('Elements', {
            'fields': ('elements_json', 'elements_count')
        }),
        ('Output files', {
            'fields': ('output_image', 'preview_image')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def elements_count(self, obj):
        return obj.elements_count
    elements_count.short_description = 'Elements'


@admin.register(DesignElement)
class DesignElementAdmin(admin.ModelAdmin):
    list_display  = ('element_id', 'design', 'element_type', 'z_index', 'x', 'y')
    list_filter   = ('element_type',)
    search_fields = ('element_id', 'design__id')
    ordering      = ('design', 'z_index')