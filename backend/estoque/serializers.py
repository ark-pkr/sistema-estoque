from decimal import Decimal
from rest_framework import serializers
from .models import MovimentacaoEstoque


class MovimentacaoEstoqueSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source="produto.nome", read_only=True)
    usuario_nome = serializers.SerializerMethodField()

    class Meta:
        model = MovimentacaoEstoque
        fields = "__all__"

    def get_usuario_nome(self, obj):
        if obj.usuario:
            return getattr(obj.usuario, "nome", None) or obj.usuario.email
        return "-"

    def create(self, validated_data):
        request = self.context.get("request")
        usuario = request.user if request and request.user.is_authenticated else None

        produto = validated_data["produto"]
        tipo = validated_data["tipo"]
        quantidade = Decimal(validated_data["quantidade"])

        movimentacao = MovimentacaoEstoque.objects.create(
            **validated_data,
            usuario=usuario,
        )

        # Atualiza estoque
        if tipo in ["ENTRADA", "REPOSICAO", "AJUSTE"]:
            produto.estoque_atual += quantidade
        elif tipo == "SAIDA":
            produto.estoque_atual -= quantidade

        produto.save()

        return movimentacao