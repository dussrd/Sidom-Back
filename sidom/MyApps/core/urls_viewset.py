from rest_framework.routers import DefaultRouter
from MyApps.core.views_viewset import TipoMaestraViewSet


router = DefaultRouter()

router.register(
    r'tipos-maestra',
    TipoMaestraViewSet
)

urlpatterns = router.urls