from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Workspace
from .serializers import WorkspaceOnboardingSerializer, WorkspaceDetailSerializer


class WorkspaceOnboardingAPIView(APIView):
    """POST /api/v1/workspaces/onboarding/ — Create workspace during onboarding."""
    def post(self, request):
        serializer = WorkspaceOnboardingSerializer(data=request.data)
        if serializer.is_valid():
            workspace = serializer.save(user=request.user)
            return Response(WorkspaceDetailSerializer(workspace).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkspaceListAPIView(APIView):
    """GET /api/v1/workspaces/ — Return the authenticated user's active workspace."""
    def get(self, request):
        workspace = Workspace.objects.filter(user=request.user).order_by('created_at').first()
        if not workspace:
            return Response({"detail": "No workspace found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(WorkspaceDetailSerializer(workspace).data, status=status.HTTP_200_OK)


class WorkspaceDetailAPIView(APIView):
    """GET + PATCH /api/v1/workspaces/{id}/ — Fetch or update a specific workspace."""
    def get_object(self, pk, user):
        try:
            return Workspace.objects.get(pk=pk, user=user)
        except Workspace.DoesNotExist:
            return None

    def get(self, request, pk):
        workspace = self.get_object(pk, request.user)
        if not workspace:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(WorkspaceDetailSerializer(workspace).data)

    def patch(self, request, pk):
        workspace = self.get_object(pk, request.user)
        if not workspace:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = WorkspaceDetailSerializer(workspace, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
