from rest_framework import serializers
from .models import ImportacaoArquivo


class ImportacaoArquivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportacaoArquivo
        fields = "__all__"
        read_only_fields = ["status", "total_registros", "observacao", "criado_em"]