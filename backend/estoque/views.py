from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import MovimentacaoEstoque
from .serializers import MovimentacaoEstoqueSerializer


class MovimentacaoEstoqueViewSet(viewsets.ModelViewSet):
    queryset = MovimentacaoEstoque.objects.select_related("produto", "usuario").all().order_by("-id")
    serializer_class = MovimentacaoEstoqueSerializer
    permission_classes = [IsAuthenticated]