from django.contrib import admin
from .models import Fornecedor


@admin.register(Fornecedor)
class FornecedorAdmin(admin.ModelAdmin):
    list_display = ("nome", "cnpj", "telefone", "cidade", "estado", "ativo")
    search_fields = ("nome", "cnpj", "email")
    list_filter = ("ativo", "estado")