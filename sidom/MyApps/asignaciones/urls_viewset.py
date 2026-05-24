from rest_framework.routers import DefaultRouter

from MyApps.asignaciones.views_viewset import (
    SolicitudDisponibleViewSet,
    AsignacionViewSet
)

router = DefaultRouter()

router.register(
    r'solicitudes-disponibles',
    SolicitudDisponibleViewSet
)

router.register(
    r'asignaciones',
    AsignacionViewSet
)

urlpatterns = router.urls