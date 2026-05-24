from rest_framework.routers import DefaultRouter
from MyApps.usuarios.views_viewset import (
    ClienteViewSet,
    DomiciliarioViewSet
)

router = DefaultRouter()

router.register(
    r'clientes',
    ClienteViewSet
)

router.register(
    r'domiciliarios',
    DomiciliarioViewSet
)

urlpatterns = router.urls