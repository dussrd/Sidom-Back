from rest_framework.routers import DefaultRouter

from MyApps.tracking.views_viewset import (
    UbicacionDomiciliarioViewSet
)

router = DefaultRouter()

router.register(
    r'ubicaciones-domiciliarios',
    UbicacionDomiciliarioViewSet
)

urlpatterns = router.urls