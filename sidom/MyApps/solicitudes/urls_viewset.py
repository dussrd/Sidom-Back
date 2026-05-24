from rest_framework.routers import DefaultRouter
from MyApps.solicitudes.views_viewset import SolicitudViewSet

router = DefaultRouter()

router.register(
    r'solicitudes',
    SolicitudViewSet
)

urlpatterns = router.urls