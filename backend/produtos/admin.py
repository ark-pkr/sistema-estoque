from django.contrib import admin
from .models import Categoria, Produto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nome",)
    search_fields = ("nome",)


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = (
        "codigo",
        "nome",
        "categoria",
        "fornecedor",
        "unidade",
        "preco_venda",
        "estoque_atual",
        "ativo",
    )
    search_fields = ("nome", "codigo", "codigo_barras", "marca")
    list_filter = ("ativo", "categoria", "fornecedor", "unidade")