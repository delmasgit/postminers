import os
import json
from io import BytesIO
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from django.conf import settings

from modules.content_editor_studio.models import Design
from .renderer import CanvasRenderer
from ..processors.text import draw_text_element
from ..processors.shapes import draw_shape_element
from ..processors.images import draw_image_element


class EditorService:

    @staticmethod
    def render_and_save(data, request=None):
        """
        Renders the canvas based on element data and saves
        both the full-size output and a 300px preview thumbnail.
        """

        # ── 1. Get or create Design ──
        design_id = data.get("design_id")
        if design_id:
            design = get_object_or_404(Design, id=design_id)
        else:
            design = Design()
            design.save()

        # ── 2. Update metadata ──
        design.background_url = data.get("background")
        design.canvas_width = data["canvas"]["width"]
        design.canvas_height = data["canvas"]["height"]

        # Store clean JSON (no OrderedDict)
        design.elements_json = json.loads(json.dumps(data["elements"]))

        # ── 3. Render canvas ──
        renderer = CanvasRenderer(
            width=data["canvas"]["width"],
            height=data["canvas"]["height"],
            background_url=data.get("background")
        )
        canvas = renderer.get_canvas()

        elements = sorted(
            data["elements"],
            key=lambda x: x.get("z_index", 0)
        )

        for element in elements:
            etype = element.get("type")
            if etype == "text":
                canvas = draw_text_element(canvas, element)
            elif etype == "shape":
                canvas = draw_shape_element(canvas, element)
            elif etype == "image":
                canvas = draw_image_element(canvas, element)

        # ── 4. Save output files ──
        preview = canvas.copy()
        preview.thumbnail((300, 300))

        final_buffer = BytesIO()
        canvas.save(final_buffer, format="PNG")

        preview_buffer = BytesIO()
        preview.save(preview_buffer, format="PNG")

        filename = f"{design.id}.png"
        preview_filename = f"{design.id}_preview.png"

        # Cleanup old files
        if design.output_image:
            design.output_image.delete(save=False)
        if design.preview_image:
            design.preview_image.delete(save=False)

        # Save new
        design.output_image.save(
            filename,
            ContentFile(final_buffer.getvalue()),
            save=False
        )
        design.preview_image.save(
            preview_filename,
            ContentFile(preview_buffer.getvalue()),
            save=False
        )

        design.save()

        # Clear buffers
        final_buffer.close()
        preview_buffer.close()

        output_url = (
            request.build_absolute_uri(design.output_image.url)
            if request else design.output_image.url
        )
        preview_url = (
            request.build_absolute_uri(design.preview_image.url)
            if request else design.preview_image.url
        )

        return {
            "design_id": design.id,
            "output_image_url": output_url,
            "preview_image_url": preview_url,
        }

    @staticmethod
    def save_with_client_preview(data, preview_data_url, request=None):
        """
        Save design JSON and use a client-rendered canvas snapshot
        as both the output and preview image. This ensures the preview
        matches exactly what the user sees in the Fabric.js editor.

        :param data: Design payload (background, canvas, elements)
        :param preview_data_url: Base64 data URL from canvas.toDataURL()
        """
        import base64
        from PIL import Image as PILImage

        # ── 1. Get or create Design ──
        design_id = data.get("design_id")
        if design_id:
            design = get_object_or_404(Design, id=design_id)
        else:
            design = Design()
            design.save()

        # ── 2. Update metadata ──
        design.background_url = data.get("background")
        design.canvas_width = data["canvas"]["width"]
        design.canvas_height = data["canvas"]["height"]
        design.elements_json = json.loads(json.dumps(data["elements"]))

        # ── 3. Decode client-rendered snapshot ──
        # Strip "data:image/png;base64," prefix
        if "," in preview_data_url:
            preview_data_url = preview_data_url.split(",", 1)[1]

        image_bytes = base64.b64decode(preview_data_url)

        # Create preview thumbnail (300px)
        full_image = PILImage.open(BytesIO(image_bytes)).convert("RGBA")
        preview_img = full_image.copy()
        preview_img.thumbnail((300, 300))

        preview_buffer = BytesIO()
        preview_img.save(preview_buffer, format="PNG")

        filename = f"{design.id}.png"
        preview_filename = f"{design.id}_preview.png"

        # Cleanup old files
        if design.output_image:
            design.output_image.delete(save=False)
        if design.preview_image:
            design.preview_image.delete(save=False)

        # Save the full-size client render as output
        design.output_image.save(
            filename,
            ContentFile(image_bytes),
            save=False
        )
        # Save the thumbnail as preview
        design.preview_image.save(
            preview_filename,
            ContentFile(preview_buffer.getvalue()),
            save=False
        )

        design.save()
        preview_buffer.close()

        output_url = (
            request.build_absolute_uri(design.output_image.url)
            if request else design.output_image.url
        )
        preview_url = (
            request.build_absolute_uri(design.preview_image.url)
            if request else design.preview_image.url
        )

        return {
            "design_id": design.id,
            "output_image_url": output_url,
            "preview_image_url": preview_url,
        }