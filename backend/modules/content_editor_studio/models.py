import uuid
from django.db import models


class Design(models.Model):
    """
    Stores one canvas design — background image URL,
    canvas dimensions, all elements as JSON, and the
    two rendered output files (full + preview).
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    background_url = models.URLField(
        max_length=2048,
        help_text='URL of the base/generated image'
    )
    canvas_width = models.PositiveIntegerField(default=1080)
    canvas_height = models.PositiveIntegerField(default=1080)

    # Full JSON snapshot of all elements — single source of truth
    elements_json = models.JSONField(
        default=list,
        blank=True,
        help_text='Ordered list of element objects'
    )

    # Rendered output files (null until first /edit/ call)
    output_image = models.ImageField(
        upload_to='outputs/',
        null=True,
        blank=True
    )
    preview_image = models.ImageField(
        upload_to='outputs/previews/',
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'content_editor_studio_designs'
        ordering  = ['-created_at']
        verbose_name        = 'Design'
        verbose_name_plural = 'Designs'

    def __str__(self):
        return f'Design {self.id} ({self.canvas_width}x{self.canvas_height})'

    @property
    def elements_count(self):
        return len(self.elements_json) if self.elements_json else 0

    @property
    def output_image_url(self):
        if self.output_image:
            return self.output_image.url
        return None

    @property
    def preview_image_url(self):
        if self.preview_image:
            return self.preview_image.url
        return None


class DesignElement(models.Model):
    """
    Optional normalised table — one row per element.
    Useful for querying / filtering elements across designs.
    The source-of-truth is still Design.elements_json;
    this table is kept in sync by EditorService.
    """

    ELEMENT_TYPES = [
        ('text',  'Text'),
        ('shape', 'Shape'),
        ('image', 'Image'),
    ]

    design = models.ForeignKey(
        Design,
        on_delete=models.CASCADE,
        related_name='elements'
    )
    element_id   = models.CharField(max_length=128)
    element_type = models.CharField(max_length=16, choices=ELEMENT_TYPES)

    x        = models.FloatField(default=0)
    y        = models.FloatField(default=0)
    width    = models.FloatField(default=100)
    height   = models.FloatField(default=100)
    rotation = models.FloatField(default=0)
    z_index  = models.IntegerField(default=0)

    style_json   = models.JSONField(default=dict, blank=True)
    content_json = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'content_editor_studio_elements'
        ordering = ['z_index']
        unique_together = ('design', 'element_id')

    def __str__(self):
        return f'{self.element_type} [{self.element_id}] on {self.design_id}'