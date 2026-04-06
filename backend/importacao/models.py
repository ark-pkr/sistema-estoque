from django.db import models


class ImportacaoArquivo(models.Model):
    TIPOS = [
        ("PDF", "PDF"),
        ("XLSX", "Excel"),
        ("CSV", "CSV"),
    ]

    STATUS = [
        ("PENDENTE", "Pendente"),
        ("PROCESSADO", "Processado"),
        ("ERRO", "Erro"),
    ]

    arquivo = models.FileField(upload_to="importacoes/")
    tipo_arquivo = models.CharField(max_length=10, choices=TIPOS)
    status = models.CharField(max_length=20, choices=STATUS, default="PENDENTE")
    total_registros = models.PositiveIntegerField(default=0)
    observacao = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo_arquivo} - {self.status} - {self.criado_em}"