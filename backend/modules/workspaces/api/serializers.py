from rest_framework import serializers
from ..models import Workspace


CATEGORY_LABELS = {
    'ecommerce_retail': 'E-commerce & Retail',
    'local_business': 'Local Business',
    'education_coaching': 'Education & Coaching',
    'software_tech': 'Software & Tech',
    'creator_brand': 'Creator & Solopreneur',
    'other_custom': 'Other / Custom',
}


class WorkspaceOnboardingSerializer(serializers.ModelSerializer):
    """Used for POST /onboarding/ — creates a new workspace."""
    class Meta:
        model = Workspace
        fields = [
            'id', 'workspace_name', 'category', 'custom_category',
            'tone_of_voice', 'primary_colors', 'logo_url', 'website_url',
            'contact_email', 'phone_number', 'physical_address', 'dynamic_fields'
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        category = attrs.get('category')
        custom_category = attrs.get('custom_category')
        if category == 'other_custom' and not custom_category:
            raise serializers.ValidationError({
                "custom_category": "Custom category is required when category is 'Other / Custom'."
            })
        return attrs


class WorkspaceDetailSerializer(serializers.ModelSerializer):
    """Used for GET / PATCH — full workspace detail including persona fields."""
    category_label = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Workspace
        fields = [
            'id', 'workspace_name', 'category', 'category_label', 'custom_category',
            'tone_of_voice', 'primary_colors', 'logo_url', 'website_url',
            'contact_email', 'phone_number', 'physical_address',
            'dynamic_fields', 'target_audience', 'brand_guidelines',
        ]
        read_only_fields = ['id', 'category', 'category_label']

    def get_category_label(self, obj):
        if obj.category == 'other_custom' and obj.custom_category:
            return obj.custom_category
        return CATEGORY_LABELS.get(obj.category, obj.category)
