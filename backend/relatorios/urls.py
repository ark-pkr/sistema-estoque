from django.urls import path
from .views import RelatorioEstoqueView

urlpatterns = [
    path("relatorios/estoque/", RelatorioEstoqueView.as_view(), name="relatorio-estoque"),
]