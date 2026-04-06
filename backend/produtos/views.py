from decimal import Decimal

from django.db.models import F
from django.db.models.deletion import ProtectedError
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from usuarios.permissions import IsAdminOrGerente
from estoque.models import MovimentacaoEstoque
from .models import Categoria, Produto
from .serializers import (
    CategoriaSerializer,
    ProdutoReposicaoSerializer,
    ProdutoSerializer,
)


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by("nome")
    serializer_class = CategoriaSerializer
    permission_classes = [IsAdminOrGerente]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome"]
    ordering_fields = ["id", "nome"]
    ordering = ["nome"]


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.select_related("categoria", "fornecedor").all().order_by("-id")
    serializer_class = ProdutoSerializer
    permission_classes = [IsAdminOrGerente]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "codigo", "marca", "fornecedor__nome"]
    ordering_fields = ["id", "nome", "codigo", "preco_venda", "estoque_atual"]
    ordering = ["-id"]

    def get_queryset(self):
        queryset = super().get_queryset()

        filtro = self.request.query_params.get("filtro")
        if filtro == "estoque_baixo":
            queryset = queryset.filter(
                estoque_atual__gt=0,
                estoque_atual__lte=F("estoque_minimo"),
            )
        elif filtro == "sem_estoque":
            queryset = queryset.filter(estoque_atual__lte=0)

        return queryset

    def destroy(self, request, *args, **kwargs):
        produto = self.get_object()

        try:
            self.perform_destroy(produto)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {
                    "detail": "Este produto não pode ser excluído porque possui movimentações ou outros vínculos no sistema."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"detail": f"Erro ao excluir produto: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"], url_path="repor-estoque")
    def repor_estoque(self, request, pk=None):
        produto = self.get_object()
        serializer = ProdutoReposicaoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quantidade = serializer.validated_data["quantidade"]
        motivo = serializer.validated_data.get("motivo", "Reposição de estoque")
        observacao = serializer.validated_data.get("observacao", "")

        produto.estoque_atual = Decimal(produto.estoque_atual or 0) + Decimal(quantidade)
        produto.save(update_fields=["estoque_atual"])

        MovimentacaoEstoque.objects.create(
            produto=produto,
            tipo="REPOSICAO",
            quantidade=quantidade,
            motivo=motivo,
            observacao=observacao,
            usuario=request.user if request.user.is_authenticated else None,
        )

        return Response(
            {
                "mensagem": "Reposição realizada com sucesso.",
                "estoque_atual": float(produto.estoque_atual),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="excluir-em-lote")
    def excluir_em_lote(self, request):
        ids = request.data.get("ids", [])

        if not ids or not isinstance(ids, list):
            return Response(
                {"erro": "Envie uma lista de IDs para exclusão."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        produtos = self.get_queryset().filter(id__in=ids)
        total = produtos.count()

        if total == 0:
            return Response(
                {"erro": "Nenhum produto encontrado para exclusão."},
                status=status.HTTP_404_NOT_FOUND,
            )

        erros = []
        excluidos = 0

        for produto in produtos:
            try:
                produto.delete()
                excluidos += 1
            except ProtectedError:
                erros.append(
                    f'O produto "{produto.nome}" não pode ser excluído porque possui movimentações ou vínculos.'
                )
            except Exception as e:
                erros.append(f'Erro ao excluir "{produto.nome}": {str(e)}')

        if erros and excluidos == 0:
            return Response(
                {
                    "erro": "Nenhum produto foi excluído.",
                    "detalhes": erros,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if erros and excluidos > 0:
            return Response(
                {
                    "mensagem": "Exclusão parcial concluída.",
                    "total_excluidos": excluidos,
                    "detalhes": erros,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "mensagem": "Produtos excluídos com sucesso.",
                "total_excluidos": excluidos,
            },
            status=status.HTTP_200_OK,
        )