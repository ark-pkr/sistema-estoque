from rest_framework.routers import DefaultRouter
from .views import ImportacaoArquivoViewSet

router = DefaultRouter()
router.register(r"importacoes", ImportacaoArquivoViewSet, basename="importacoes")

urlpatterns = router.urls