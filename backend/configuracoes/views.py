from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from usuarios.permissions import IsAdmin, IsAuthenticatedAndActive
from .models import ConfiguracaoSistema
from .serializers import ConfiguracaoSistemaSerializer


class ConfiguracaoSistemaViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracaoSistema.objects.all().order_by("id")
    serializer_class = ConfiguracaoSistemaSerializer

    def get_permissions(self):
        if self.action in ["tema_atual"]:
            return [IsAuthenticatedAndActive()]
        return [IsAuthenticatedAndActive(), IsAdmin()]

    def list(self, request, *args, **kwargs):
        config, _ = ConfiguracaoSistema.objects.get_or_create(id=1)
        serializer = self.get_serializer(config, context={"request": request})
        return Response([serializer.data], status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="tema-atual")
    def tema_atual(self, request):
        config, _ = ConfiguracaoSistema.objects.get_or_create(id=1)
        serializer = self.get_serializer(config, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        if ConfiguracaoSistema.objects.exists():
            return Response(
                {"detail": "Já existe uma configuração do sistema. Use edição."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().create(request, *args, **kwargs)