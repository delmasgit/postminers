from rest_framework import serializers
from .models import Design


# ──────────────────────────────────────────────
# Element serializer — lenient validation
# Accepts any dict for style/content to avoid
# breaking on fabric.js edge-case formats
# ──────────────────────────────────────────────

class ElementSerializer(serializers.Serializer):
    id       = serializers.CharField(max_length=128)
    type     = serializers.ChoiceField(choices=['text', 'shape', 'image'])
    x        = serializers.FloatField(required=False, default=0)
    y        = serializers.FloatField(required=False, default=0)
    width    = serializers.FloatField(required=False, default=100)
    height   = serializers.FloatField(required=False, default=100)
    rotation = serializers.FloatField(required=False, default=0)
    z_index  = serializers.IntegerField(required=False, default=0)
    style    = serializers.DictField(required=False, default=dict)
    content  = serializers.DictField(required=False, default=dict)


# ──────────────────────────────────────────────
# Canvas serializer
# ──────────────────────────────────────────────

class CanvasSerializer(serializers.Serializer):
    width  = serializers.IntegerField(min_value=50, max_value=8000, default=1080)
    height = serializers.IntegerField(min_value=50, max_value=8000, default=1080)


# ──────────────────────────────────────────────
# Top-level request serializers
# ──────────────────────────────────────────────

class DesignEditRequestSerializer(serializers.Serializer):
    """Used by POST /api/designs/edit/"""
    design_id  = serializers.UUIDField(required=False, allow_null=True, default=None)
    background = serializers.CharField(max_length=4096, required=False, default='#ffffff')
    canvas     = CanvasSerializer()
    elements   = ElementSerializer(many=True, required=False, default=list)


class DesignSaveRequestSerializer(serializers.Serializer):
    """Used by POST /api/designs/save/"""
    design_id  = serializers.UUIDField(required=False, allow_null=True, default=None)
    background = serializers.CharField(max_length=4096, required=False, default='#ffffff')
    canvas     = CanvasSerializer()
    elements   = ElementSerializer(many=True, required=False, default=list)


# ──────────────────────────────────────────────
# Response serializers (for list / detail views)
# ──────────────────────────────────────────────

class DesignListSerializer(serializers.ModelSerializer):
    preview_image_url = serializers.SerializerMethodField()
    elements_count    = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Design
        fields = [
            'id', 'canvas_width', 'canvas_height',
            'preview_image_url', 'elements_count',
            'created_at', 'updated_at'
        ]

    def get_preview_image_url(self, obj):
        request = self.context.get('request')
        if obj.preview_image and request:
            return request.build_absolute_uri(obj.preview_image.url)
        return None


class DesignDetailSerializer(serializers.ModelSerializer):
    output_image_url  = serializers.SerializerMethodField()
    preview_image_url = serializers.SerializerMethodField()
    elements_count    = serializers.IntegerField(read_only=True)
    canvas            = serializers.SerializerMethodField()

    class Meta:
        model  = Design
        fields = [
            'id', 'background_url', 'canvas',
            'elements_json', 'elements_count',
            'output_image_url', 'preview_image_url',
            'created_at', 'updated_at'
        ]

    def get_output_image_url(self, obj):
        request = self.context.get('request')
        if obj.output_image and request:
            return request.build_absolute_uri(obj.output_image.url)
        return None

    def get_preview_image_url(self, obj):
        request = self.context.get('request')
        if obj.preview_image and request:
            return request.build_absolute_uri(obj.preview_image.url)
        return None

    def get_canvas(self, obj):
        return {'width': obj.canvas_width, 'height': obj.canvas_height}