from rest_framework.routers import DefaultRouter
from .views import ConfiguracaoSistemaViewSet

router = DefaultRouter()
router.register(r"configuracoes", ConfiguracaoSistemaViewSet, basename="configuracao")

urlpatterns = router.urls