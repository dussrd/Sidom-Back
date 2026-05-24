from rest_framework import viewsets

from MyApps.entregas.models import (
    HistorialEstadoEntrega,
    SeguimientoEntrega,
    Novedad
)

from MyApps.entregas.serializers import (
    HistorialEstadoEntregaSerializer,
    SeguimientoEntregaSerializer,
    NovedadSerializer
)


class HistorialEstadoEntregaViewSet(viewsets.ModelViewSet):
    queryset = HistorialEstadoEntrega.objects.all()
    serializer_class = HistorialEstadoEntregaSerializer


class SeguimientoEntregaViewSet(viewsets.ModelViewSet):
    queryset = SeguimientoEntrega.objects.all()
    serializer_class = SeguimientoEntregaSerializer


class NovedadViewSet(viewsets.ModelViewSet):
    queryset = Novedad.objects.all()
    serializer_class = NovedadSerializer