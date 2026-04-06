from django.contrib import admin
from .models import MovimentacaoEstoque


@admin.register(MovimentacaoEstoque)
class MovimentacaoEstoqueAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "produto",
        "tipo",
        "quantidade",
        "motivo",
        "usuario",
        "data",
    )
    list_filter = (
        "tipo",
        "data",
    )
    search_fields = (
        "produto__nome",
        "produto__codigo",
        "motivo",
        "observacao",
        "usuario__email",
        "usuario__nome",
    )
    ordering = ("-data",)