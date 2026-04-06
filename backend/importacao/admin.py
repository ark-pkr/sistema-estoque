from django.contrib import admin
from .models import ImportacaoArquivo


@admin.register(ImportacaoArquivo)
class ImportacaoArquivoAdmin(admin.ModelAdmin):
    list_display = ("id", "tipo_arquivo", "status", "total_registros", "criado_em")
    list_filter = ("tipo_arquivo", "status")