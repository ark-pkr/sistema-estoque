from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from usuarios.permissions import IsAdmin, IsAdminOrGerente
from .models import ImportacaoArquivo
from .serializers import ImportacaoArquivoSerializer


class ImportacaoArquivoViewSet(viewsets.ModelViewSet):
    queryset = ImportacaoArquivo.objects.all().order_by("-id")
    serializer_class = ImportacaoArquivoSerializer
    permission_classes = [IsAdminOrGerente]

    @action(detail=False, methods=["post"], url_path="limpar-importacao", permission_classes=[IsAdmin])
    def limpar_importacao(self, request):
        # sua lógica atual de limpeza aqui
        return Response(
            {"mensagem": "Limpeza executada com sucesso."},
            status=status.HTTP_200_OK,
        )