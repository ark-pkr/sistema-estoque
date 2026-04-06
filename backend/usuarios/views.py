from django.contrib.auth import get_user_model
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsAuthenticatedAndActive
from .serializers import (
    EmailTokenObtainPairSerializer,
    UsuarioMeSerializer,
    UsuarioSerializer,
)

User = get_user_model()


class EmailLoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class UsuarioMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioMeSerializer(request.user)
        return Response(serializer.data)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticatedAndActive]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "email", "tipo"]
    ordering_fields = ["id", "nome", "email", "tipo"]
    ordering = ["-id"]