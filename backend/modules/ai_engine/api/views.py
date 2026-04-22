import uuid
import json
import traceback

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings

from google import genai
from google.genai import types

from modules.workspaces.models import Workspace
from modules.content_editor_studio.models import Design


# Canvas presets matching the frontend studio PRESETS exactly
CANVAS_PRESETS = [
    {"label": "Instagram Post",    "w": 1080, "h": 1080},
    {"label": "Instagram Story",   "w": 1080, "h": 1920},
    {"label": "Facebook Post",     "w": 1200, "h": 630},
    {"label": "Twitter / X",       "w": 1200, "h": 675},
    {"label": "LinkedIn Post",     "w": 1200, "h": 627},
    {"label": "YouTube Thumbnail", "w": 1280, "h": 720},
    {"label": "Pinterest Pin",     "w": 1000, "h": 1500},
]

# Default 3 presets for AI generation (one square, one landscape, one portrait)
DEFAULT_GENERATION_PRESETS = [
    CANVAS_PRESETS[0],  # Instagram Post  1080x1080
    CANVAS_PRESETS[2],  # Facebook Post   1200x630
    CANVAS_PRESETS[1],  # Instagram Story 1080x1920
]


class GenerateDesignsView(APIView):
    """
    POST /api/v1/ai-engine/generate/
    Accepts {"prompt": "..."}, generates exactly 3 social-media post templates
    via Gemini (each at a different platform canvas size),
    auto-saves each as a Design in the content_editor_studio DB,
    and returns the saved design IDs.
    """
    permission_classes = [IsAuthenticated]

    # ── helpers ──────────────────────────────────────────────────────
    @staticmethod
    def _build_brand_context(workspace):
        """Extract brand persona fields into a text block for the AI."""
        if not workspace:
            return ""

        parts = [
            "Brand Persona Context (YOU MUST follow these brand rules):",
            f"- Brand Name: {workspace.workspace_name}",
            f"- Category: {workspace.category}",
            f"- Tone of Voice: {workspace.tone_of_voice or 'Professional and engaging'}",
            f"- Target Audience: {workspace.target_audience or 'General audience'}",
            f"- Brand Guidelines: {workspace.brand_guidelines or 'Clean and modern aesthetic'}",
        ]
        if workspace.primary_colors:
            parts.append(
                f"- Brand Colors (prefer these hex codes): {', '.join(workspace.primary_colors)}"
            )
        return "\n".join(parts)

    @staticmethod
    def _build_system_instruction(brand_context, presets):
        """
        Build the system prompt.  Each of the 3 designs MUST use
        a specific canvas size from the presets list so elements
        are positioned correctly for that platform.
        """
        preset_specs = "\n".join([
            f"  Design {i+1}: \"{p['label']}\" — canvas {p['w']}x{p['h']}"
            for i, p in enumerate(presets)
        ])

        return f"""You are an expert social media graphic designer.
You will receive a user prompt describing a post idea.
Generate EXACTLY 3 distinct social media post design templates.

{brand_context}

CANVAS SIZES — each design MUST use the exact dimensions listed:
{preset_specs}

OUTPUT FORMAT — strict JSON array of 3 objects, nothing else:
[
  {{
    "background": "#HexColor",
    "canvas": {{"width": {presets[0]['w']}, "height": {presets[0]['h']}}},
    "elements": [
      {{
        "id": "unique-string",
        "type": "shape",
        "x": 0, "y": 0, "width": {presets[0]['w']}, "height": {presets[0]['h']},
        "rotation": 0, "z_index": 0,
        "style": {{"color": "#HexColor", "opacity": 1, "stroke_color": null, "stroke_width": 0, "border_radius": 0}},
        "content": {{"shape": "rectangle"}}
      }},
      {{
        "id": "unique-string",
        "type": "text",
        "x": 100, "y": 300, "width": 880, "height": 200,
        "rotation": 0, "z_index": 1,
        "style": {{"font_size": 72, "font_family": "arial", "font_weight": "bold", "font_style": "normal", "color": "#FFFFFF", "opacity": 1, "text_align": "center", "line_height": 1.2}},
        "content": {{"text": "Main Headline Text"}}
      }}
    ]
  }}
]

DESIGN RULES:
1. Return EXACTLY 3 objects in the JSON array — no more, no less.
2. Design 1 canvas MUST be {presets[0]['w']}x{presets[0]['h']} ({presets[0]['label']}).
   Design 2 canvas MUST be {presets[1]['w']}x{presets[1]['h']} ({presets[1]['label']}).
   Design 3 canvas MUST be {presets[2]['w']}x{presets[2]['h']} ({presets[2]['label']}).
3. ALL element x, y, width, height values MUST fit within that design's canvas bounds.
   - No element should have x + width > canvas width or y + height > canvas height.
   - Position elements proportionally for each aspect ratio.
4. Each design MUST have a unique visual style (e.g. minimalist, bold/vibrant, editorial/typographic).
5. Every element MUST have a unique "id" string (use descriptive ids like "bg-shape-1", "headline-text-1").
6. Shapes can be: rectangle, circle, triangle, star, line.
7. Ensure excellent color contrast — dark text on light backgrounds, light text on dark backgrounds.
8. Text must be short, punchy, and directly relevant to the user's prompt.
9. Use 3-6 elements per design for visual richness (mix shapes and text layers).
10. Output ONLY the JSON array. No markdown, no code fences, no explanation."""

    @staticmethod
    def _inject_element_ids(elements):
        """Guarantee every element has a unique id for DB sync."""
        for el in elements:
            if not el.get("id"):
                el["id"] = f"ai-{uuid.uuid4().hex[:8]}"
        return elements

    @staticmethod
    def _clamp_elements(elements, canvas_w, canvas_h):
        """
        Safety net: ensure no element overflows the canvas bounds.
        If the AI placed something out of bounds, clamp it.
        """
        for el in elements:
            el_w = el.get("width", 100)
            el_h = el.get("height", 100)
            el["x"] = max(0, min(el.get("x", 0), canvas_w - min(el_w, canvas_w)))
            el["y"] = max(0, min(el.get("y", 0), canvas_h - min(el_h, canvas_h)))
            el["width"] = min(el_w, canvas_w)
            el["height"] = min(el_h, canvas_h)
        return elements

    @staticmethod
    def _save_design_with_preview(design_data, expected_preset, request=None):
        """
        Persist one AI-generated design into the content_editor_studio
        Design table AND render a server-side preview image via EditorService.
        """
        from modules.content_editor_studio.services.editor import EditorService

        # Build the payload EditorService expects
        payload = {
            "background": design_data.get("background", "#FFFFFF"),
            "canvas": {
                "width": expected_preset["w"],
                "height": expected_preset["h"],
            },
            "elements": design_data.get("elements", []),
        }

        result = EditorService.render_and_save(data=payload, request=request)
        return str(result["design_id"])

    # ── main handler ────────────────────────────────────────────────
    def post(self, request):
        prompt = request.data.get("prompt", "").strip()
        if not prompt:
            return Response(
                {"status": "error", "message": "Prompt is required.", "code": "MISSING_PROMPT"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Fetch brand context
        workspace = Workspace.objects.filter(user=request.user).first()
        brand_context = self._build_brand_context(workspace)

        # 2. Validate API key
        api_key = settings.GOOGLE_AI_API_KEY
        if not api_key:
            return Response(
                {"status": "error", "message": "AI not configured. Add GOOGLE_AI_API_KEY to .env"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3. Determine canvas presets
        presets = DEFAULT_GENERATION_PRESETS

        # 4. Call Gemini
        try:
            client = genai.Client(api_key=api_key)
            system_instruction = self._build_system_instruction(brand_context, presets)

            response = client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=f"User prompt: {prompt}",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.8,
                ),
            )

            raw_text = response.text
            designs_data = json.loads(raw_text)

            if not isinstance(designs_data, list):
                raise ValueError("AI returned non-list JSON")

            # Enforce exactly 3
            designs_data = designs_data[:3]
            if len(designs_data) < 3:
                raise ValueError(f"AI returned only {len(designs_data)} designs instead of 3")

        except json.JSONDecodeError as e:
            traceback.print_exc()
            return Response(
                {"status": "error", "message": f"AI returned invalid JSON: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"status": "error", "message": f"AI generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 5. Auto-save each design with rendered preview
        saved_ids = []
        try:
            for i, design_payload in enumerate(designs_data):
                preset = presets[i]
                # Inject IDs and clamp elements to canvas bounds
                design_payload["elements"] = self._inject_element_ids(
                    design_payload.get("elements", [])
                )
                design_payload["elements"] = self._clamp_elements(
                    design_payload["elements"], preset["w"], preset["h"]
                )
                design_id = self._save_design_with_preview(
                    design_payload, preset, request=request
                )
                saved_ids.append(design_id)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"status": "error", "message": f"Failed to save designs: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            "status": "success",
            "message": "3 templates generated and saved.",
            "data": {"design_ids": saved_ids}
        }, status=status.HTTP_201_CREATED)
