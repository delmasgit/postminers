import os
import time
import json

from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from .models import Design, DesignElement
from .serializers import (
    DesignEditRequestSerializer,
    DesignSaveRequestSerializer,
    DesignListSerializer,
    DesignDetailSerializer,
)
from .services.editor import EditorService


# ============================================
# HELPERS
# ============================================
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import uuid


def _clean_elements(elements):
    """
    Convert OrderedDict / nested OrderedDict objects
    coming from DRF validated_data into plain dicts
    so they serialise cleanly into JSON for the DB.
    """
    return json.loads(json.dumps(elements))


def _sync_design_elements(design, elements):
    """
    Keep the normalised DesignElement table in sync
    with Design.elements_json (the source of truth).
    """
    # Wipe old rows for this design
    DesignElement.objects.filter(design=design).delete()

    for el in elements:
        DesignElement.objects.create(
            design=design,
            element_id=el['id'],
            element_type=el['type'],
            x=el.get('x', 0),
            y=el.get('y', 0),
            width=el.get('width', 100),
            height=el.get('height', 100),
            rotation=el.get('rotation', 0),
            z_index=el.get('z_index', 0),
            style_json=el.get('style', {}),
            content_json=el.get('content', {}),
        )


class ImageUploadView(APIView):
    def post(self, request):
        if 'image' not in request.FILES:
            return error(code='NO_FILE', message='No image file provided.')
            
        file = request.FILES['image']
        fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'uploads'))
        
        ext = file.name.split('.')[-1]
        filename = f"{uuid.uuid4().hex}.{ext}"
        
        saved_name = fs.save(filename, file)
        file_url = f"{settings.MEDIA_URL}uploads/{saved_name}"
        
        return success(
            message='Image uploaded successfully.',
            data={'url': request.build_absolute_uri(file_url)}
        )

def success(data=None, message='OK', http_status=status.HTTP_200_OK):
    return Response(
        {
            'status': 'success',
            'message': message,
            'data': data
        },
        status=http_status
    )


def error(code, message, errors=None, http_status=status.HTTP_400_BAD_REQUEST):
    body = {
        'status': 'error',
        'code': code,
        'message': message
    }

    if errors:
        body['errors'] = errors

    return Response(body, status=http_status)


# ============================================
# POST /api/designs/edit/
# Render final image
# ============================================

class EditDesignView(APIView):

    def post(self, request):
        serializer = DesignEditRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return error(
                code='VALIDATION_ERROR',
                message='Invalid request data.',
                errors=serializer.errors
            )

        try:
            start = time.time()

            # Clean OrderedDicts before passing to service
            data = serializer.validated_data
            data['elements'] = _clean_elements(data['elements'])
            if isinstance(data.get('canvas'), dict) is False:
                data['canvas'] = dict(data['canvas'])

            if data.get("preview_data_url"):
                result = EditorService.save_with_client_preview(
                    data=data,
                    preview_data_url=data["preview_data_url"],
                    request=request
                )
            else:
                result = EditorService.render_and_save(
                    data=data,
                    request=request
                )

            elapsed = round((time.time() - start) * 1000)

            return success(
                message='Image generated successfully.',
                data={
                    'design_id': str(result['design_id']),
                    'output_image_url': result['output_image_url'],
                    'preview_image_url': result['preview_image_url'],
                    'canvas': dict(data['canvas']),
                    'elements_count': len(data['elements']),
                    'processing_time_ms': elapsed,
                }
            )

        except ValueError as e:
            return error(
                code='INVALID_INPUT',
                message=str(e)
            )

        except Exception as e:
            return error(
                code='PROCESSING_ERROR',
                message=f'Rendering failed: {str(e)}',
                http_status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================
# POST /api/designs/save/
# Save JSON only (no render)
# ============================================

class SaveDesignView(APIView):
    def post(self, request):
        serializer = DesignSaveRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return error(
                code='VALIDATION_ERROR',
                message='Invalid request data.',
                errors=serializer.errors
            )

        data = serializer.validated_data
        design_id = data.get('design_id')

        if design_id:
            design = get_object_or_404(Design, id=design_id)
        else:
            design = Design()

        design.background_url = data['background']
        design.canvas_width = data['canvas']['width']
        design.canvas_height = data['canvas']['height']

        # Clean OrderedDicts → plain dicts for proper JSON storage
        clean_elements = _clean_elements(data['elements'])
        design.elements_json = clean_elements

        design.save()

        # Keep normalised element table in sync
        _sync_design_elements(design, clean_elements)

        return success(
            message='Design saved.',
            data={
                'design_id': str(design.id),
                'updated_at': design.updated_at.isoformat(),
            }
        )


# ============================================
# PAGINATION
# ============================================

class DesignPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ============================================
# GET /api/designs/
# List all designs
# ============================================

class DesignListView(APIView):

    def get(self, request):
        designs = Design.objects.all()

        paginator = DesignPagination()
        page = paginator.paginate_queryset(designs, request)

        serializer = DesignListSerializer(
            page,
            many=True,
            context={'request': request}
        )

        return Response({
            'status': 'success',
            'data': {
                'count': paginator.page.paginator.count,
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
                'results': serializer.data,
            }
        })


# ============================================
# GET /api/designs/<uuid>/
# DELETE /api/designs/<uuid>/
# ============================================

class DesignDetailView(APIView):

    def get(self, request, pk):
        design = get_object_or_404(Design, pk=pk)

        serializer = DesignDetailSerializer(
            design,
            context={'request': request}
        )

        return success(data=serializer.data)

    def delete(self, request, pk):
        design = get_object_or_404(Design, pk=pk)

        try:
            # Delete output image physically
            if design.output_image:
                output_path = design.output_image.path

                if os.path.isfile(output_path):
                    os.remove(output_path)

            # Delete preview image physically
            if design.preview_image:
                preview_path = design.preview_image.path

                if os.path.isfile(preview_path):
                    os.remove(preview_path)

            # Delete DB record
            design.delete()

            return success(
                message='Design deleted successfully.',
                data={
                    'design_id': str(pk)
                }
            )

        except Exception as e:
            return error(
                code='DELETE_ERROR',
                message=str(e),
                http_status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )