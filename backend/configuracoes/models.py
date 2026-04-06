from django.db import models


class ConfiguracaoSistema(models.Model):
    nome_empresa = models.CharField(max_length=150, default="Minha Empresa")
    nome_sistema = models.CharField(max_length=150, default="Sistema de Estoque")
    logo = models.ImageField(upload_to="logos/", blank=True, null=True)

    cor_primaria = models.CharField(max_length=20, default="#2563eb")
    cor_secundaria = models.CharField(max_length=20, default="#0f172a")
    cor_fundo = models.CharField(max_length=20, default="#eef2f7")
    cor_texto = models.CharField(max_length=20, default="#0f172a")
    cor_card = models.CharField(max_length=20, default="#ffffff")
    cor_botao_perigo = models.CharField(max_length=20, default="#ef4444")

    fonte_base = models.CharField(max_length=50, default="Inter")
    tamanho_fonte_base = models.IntegerField(default=15)
    tamanho_logo = models.IntegerField(default=44)
    raio_borda = models.IntegerField(default=20)
    largura_container = models.IntegerField(default=1500)

    exibir_subtitulo_empresa = models.BooleanField(default=True)
    layout_compacto = models.BooleanField(default=False)

    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome_sistema