from rest_framework import filters, viewsets

from usuarios.permissions import IsAdminOrGerenteOrReadOnly
from .models import Fornecedor
from .serializers import FornecedorSerializer


class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all().order_by("-id")
    serializer_class = FornecedorSerializer
    permission_classes = [IsAdminOrGerenteOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "contato", "cidade"]
    ordering_fields = ["id", "nome", "cidade"]
    ordering = ["-id"]