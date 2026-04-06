from decimal import Decimal, InvalidOperation

from rest_framework import serializers

from estoque.models import MovimentacaoEstoque
from .models import Categoria, Produto


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nome"]


class ProdutoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.SerializerMethodField()
    fornecedor_nome = serializers.SerializerMethodField()

    estoque_inicial = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        write_only=True,
        required=False,
        default=Decimal("0.00"),
    )

    class Meta:
        model = Produto
        fields = [
            "id",
            "codigo",
            "nome",
            "categoria",
            "categoria_nome",
            "fornecedor",
            "fornecedor_nome",
            "marca",
            "unidade",
            "preco_custo",
            "preco_venda",
            "estoque_atual",
            "estoque_minimo",
            "estoque_inicial",
            "descricao",
            "ativo",
        ]
        read_only_fields = ["estoque_atual"]

    def get_categoria_nome(self, obj):
        return getattr(getattr(obj, "categoria", None), "nome", "-")

    def get_fornecedor_nome(self, obj):
        return getattr(getattr(obj, "fornecedor", None), "nome", "-")

    def validate_codigo(self, value):
        qs = Produto.objects.filter(codigo=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError("Já existe um produto com este código.")

        return value

    def validate(self, attrs):
        preco_custo = attrs.get("preco_custo", getattr(self.instance, "preco_custo", Decimal("0")))
        preco_venda = attrs.get("preco_venda", getattr(self.instance, "preco_venda", Decimal("0")))
        estoque_minimo = attrs.get("estoque_minimo", getattr(self.instance, "estoque_minimo", Decimal("0")))
        estoque_inicial = attrs.get("estoque_inicial", Decimal("0"))

        if preco_custo is not None and Decimal(preco_custo) < 0:
            raise serializers.ValidationError({"preco_custo": "Preço de custo não pode ser negativo."})

        if preco_venda is not None and Decimal(preco_venda) < 0:
            raise serializers.ValidationError({"preco_venda": "Preço de venda não pode ser negativo."})

        if estoque_minimo is not None and Decimal(estoque_minimo) < 0:
            raise serializers.ValidationError({"estoque_minimo": "Estoque mínimo não pode ser negativo."})

        if estoque_inicial is not None and Decimal(estoque_inicial) < 0:
            raise serializers.ValidationError({"estoque_inicial": "Estoque inicial não pode ser negativo."})

        return attrs

    def create(self, validated_data):
        estoque_inicial = validated_data.pop("estoque_inicial", Decimal("0.00"))
        request = self.context.get("request")
        usuario = getattr(request, "user", None) if request else None

        produto = Produto.objects.create(
            **validated_data,
            estoque_atual=estoque_inicial,
        )

        if Decimal(estoque_inicial) > 0:
            MovimentacaoEstoque.objects.create(
                produto=produto,
                tipo="ENTRADA",
                quantidade=estoque_inicial,
                motivo="Estoque inicial no cadastro",
                observacao="Movimentação criada automaticamente no cadastro do produto.",
                usuario=usuario if getattr(usuario, "is_authenticated", False) else None,
            )

        return produto

    def update(self, instance, validated_data):
        # estoque_inicial não deve editar estoque em atualização
        validated_data.pop("estoque_inicial", None)
        validated_data.pop("estoque_atual", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class ProdutoReposicaoSerializer(serializers.Serializer):
    quantidade = serializers.DecimalField(max_digits=12, decimal_places=2)
    motivo = serializers.CharField(required=False, allow_blank=True, default="Reposição de estoque")
    observacao = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_quantidade(self, value):
        if Decimal(value) <= 0:
            raise serializers.ValidationError("A quantidade da reposição deve ser maior que zero.")
        return value