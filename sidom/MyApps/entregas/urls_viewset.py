from rest_framework.routers import DefaultRouter

from MyApps.entregas.views_viewset import (
    HistorialEstadoEntregaViewSet,
    SeguimientoEntregaViewSet,
    NovedadViewSet
)

router = DefaultRouter()

router.register(
    r'historial-estados-entrega',
    HistorialEstadoEntregaViewSet
)

router.register(
    r'seguimientos-entrega',
    SeguimientoEntregaViewSet
)

router.register(
    r'novedades',
    NovedadViewSet
)

urlpatterns = router.urls