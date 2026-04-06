from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovimentacaoEstoqueViewSet
from .dashboard_views import DashboardStatsView

router = DefaultRouter()
router.register(r"movimentacoes", MovimentacaoEstoqueViewSet)

urlpatterns = [
    path("dashboard/", DashboardStatsView.as_view()),
    path("", include(router.urls)),
]