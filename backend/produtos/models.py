from django.db import models


class Categoria(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Produto(models.Model):
    UNIDADES = [
        ("UN", "Unidade"),
        ("SC", "Saco"),
        ("CX", "Caixa"),
        ("LT", "Litro"),
        ("KG", "Quilo"),
        ("MT", "Metro"),
        ("M2", "Metro Quadrado"),
        ("M3", "Metro Cúbico"),
    ]

    nome = models.CharField(max_length=255)
    codigo = models.CharField(max_length=50, unique=True)
    codigo_barras = models.CharField(max_length=100, blank=True, null=True)

    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name="produtos"
    )

    fornecedor = models.ForeignKey(
        "fornecedores.Fornecedor",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="produtos"
    )

    marca = models.CharField(max_length=100, blank=True, null=True)
    unidade = models.CharField(max_length=10, choices=UNIDADES, default="UN")

    preco_custo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    estoque_atual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estoque_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    descricao = models.TextField(blank=True, null=True)
    ativo = models.BooleanField(default=True)

    importado = models.BooleanField(default=False)
    origem_importacao = models.CharField(max_length=20, blank=True, null=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
        ordering = ["nome"]

    def __str__(self):
        return f"{self.codigo} - {self.nome}"