from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, ProdutoViewSet

router = DefaultRouter()
router.register(r"categorias", CategoriaViewSet, basename="categoria")
router.register(r"produtos", ProdutoViewSet, basename="produto")

urlpatterns = router.urls