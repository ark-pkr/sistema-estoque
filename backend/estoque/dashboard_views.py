from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from produtos.models import Produto
from fornecedores.models import Fornecedor
from estoque.models import MovimentacaoEstoque


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            hoje = timezone.now()
            sete_dias = hoje - timedelta(days=7)
            trinta_dias = hoje - timedelta(days=30)

            # =====================
            # CARDS
            # =====================
            total_produtos = Produto.objects.count()
            total_fornecedores = Fornecedor.objects.count()
            total_movimentacoes = MovimentacaoEstoque.objects.count()

            estoque_baixo = Produto.objects.filter(
                estoque_atual__lte=10
            ).count()

            sem_estoque = Produto.objects.filter(
                estoque_atual=0
            ).count()

            # =====================
            # MOVIMENTAÇÕES 7 DIAS
            # =====================
            movimentacoes_7dias = (
                MovimentacaoEstoque.objects
                .filter(data__gte=sete_dias)
                .values("data__date", "tipo")
                .annotate(total=Sum("quantidade"))
                .order_by("data__date")
            )

            # =====================
            # TOP PRODUTOS
            # =====================
            top_produtos = (
                MovimentacaoEstoque.objects
                .filter(data__gte=trinta_dias)
                .values("produto__nome")
                .annotate(total=Sum("quantidade"))
                .order_by("-total")[:5]
            )

            return Response({
                "cards": {
                    "total_produtos": total_produtos,
                    "total_fornecedores": total_fornecedores,
                    "total_movimentacoes": total_movimentacoes,
                    "estoque_baixo": estoque_baixo,
                    "sem_estoque": sem_estoque,
                },
                "movimentacoes_7dias": list(movimentacoes_7dias),
                "top_produtos": list(top_produtos),
            })

        except Exception as e:
            return Response({
                "erro": str(e)
            }, status=500)