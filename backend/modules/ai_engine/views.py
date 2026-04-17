import os
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from google import genai
from google.genai import types

from modules.workspaces.models import Workspace
from modules.content_editor_studio.services.editor import EditorService
from rest_framework import status

class GenerateDesignsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt')
        if not prompt:
            return Response({'status': 'error', 'message': 'Prompt is required', 'code': 'MISSING_PROMPT'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Fetch persona / brand details
        # We grab the first workspace for the user (assuming they have one setup from onboarding)
        workspace = Workspace.objects.filter(user=request.user).first()
        
        brand_context = ""
        if workspace:
            brand_context = f"""
            Brand Persona Context:
            - Brand Name: {workspace.workspace_name}
            - Category: {workspace.category}
            - Tone of Voice: {workspace.tone_of_voice or 'Professional and engaging'}
            - Target Audience: {workspace.target_audience or 'General public'}
            - Brand Guidelines: {workspace.brand_guidelines or 'Clean and modern'}
            """
            if workspace.primary_colors:
                brand_context += f"- Primary Colors (Use these hex codes in your designs): {', '.join(workspace.primary_colors)}\n"

        # 2. Configure Gemini API
        # Provide fallback if key not present (or use settings.GOOGLE_API_KEY)
        api_key = os.environ.get("GOOGLE_AI_API_KEY", "")
        if not api_key:
            return Response({'status': 'error', 'message': 'Server AI configuration missing. Please add GOOGLE_AI_API_KEY to .env'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # We will use gemini-2.5-flash for fast and reliable JSON generation
        # (or gemini-1.5-pro if 2.5 is not available)
        client = genai.Client(api_key=api_key)
        
        system_instruction = f"""
        You are an expert graphic designer and social media post creator.
        Generate exactly 3 distinct social media post design templates based on the user's prompt.
        {brand_context}
        
        Your output MUST be a valid JSON array containing exactly 3 objects. 
        Each object represents a design template and must follow this EXACT structure:
        {{
            "background": "#HexColor", 
            "canvas": {{"width": 1080, "height": 1080}},
            "elements": [
                {{
                    "type": "shape",
                    "x": 100, "y": 100, "width": 880, "height": 880, "rotation": 0, "z_index": 0,
                    "style": {{"color": "#HexColor", "opacity": 1, "stroke_color": null, "stroke_width": 0, "border_radius": 20}},
                    "content": {{"shape": "rectangle"}} // can be rectangle, circle, triangle, star, line
                }},
                {{
                    "type": "text",
                    "x": 150, "y": 200, "width": 780, "height": 150, "rotation": 0, "z_index": 1,
                    "style": {{"font_size": 80, "font_family": "arial", "font_weight": "bold", "font_style": "normal", "color": "#HexColor", "opacity": 1, "text_align": "left", "line_height": 1.2}},
                    "content": {{"text": "Catchy Headline Here"}}
                }}
            ]
        }}
        
        Rules:
        - Generate 3 distinct designs (e.g. one minimalist, one bold/vibrant, one typographic).
        - Ensure good contrast between background, shapes, and text colors.
        - Text MUST be engaging, short, and directly relevant to the user prompt.
        - ALWAYS return an array of 3 objects, and nothing else (no markdown wrapping).
        """

        # 3. Call API
        try:
            response = client.models.generate_content(
                model='gemini-1.5-pro',
                contents=f"User Prompt: {prompt}",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.7
                )
            )
            response_text = response.text
            
            # The model is configured to return JSON, parse it
            designs_data = json.loads(response_text)
            
            if not isinstance(designs_data, list) or len(designs_data) == 0:
                return Response({'status': 'error', 'message': 'AI did not return a valid list of designs'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'status': 'error', 'message': f'AI Generation Failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4. Save the generated designs
        saved_design_ids = []
        try:
            for design_payload in designs_data:
                # Use EditorService to save and render the preview image immediately
                # (The data matches the payload structure EditorService expects)
                result = EditorService.render_and_save(design_payload, request=request)
                saved_design_ids.append(result["design_id"])
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'status': 'error', 'message': f'Failed to save AI designs: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'status': 'success',
            'message': 'Successfully generated templates',
            'data': {'design_ids': saved_design_ids}
        }, status=status.HTTP_200_OK)
