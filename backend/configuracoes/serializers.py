from rest_framework import serializers
from .models import ConfiguracaoSistema


class ConfiguracaoSistemaSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = ConfiguracaoSistema
        fields = [
            "id",
            "nome_empresa",
            "nome_sistema",
            "logo",
            "logo_url",
            "cor_primaria",
            "cor_secundaria",
            "cor_fundo",
            "cor_texto",
            "cor_card",
            "cor_botao_perigo",
            "fonte_base",
            "tamanho_fonte_base",
            "tamanho_logo",
            "raio_borda",
            "largura_container",
            "exibir_subtitulo_empresa",
            "layout_compacto",
            "atualizado_em",
        ]

    def get_logo_url(self, obj):
        request = self.context.get("request")
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        if obj.logo:
            return obj.logo.url
        return None