from rest_framework import viewsets
from MyApps.asignaciones.models import (
    SolicitudDisponible,
    Asignacion
)

from MyApps.asignaciones.serializers import (
    SolicitudDisponibleSerializer,
    AsignacionSerializer
)


class SolicitudDisponibleViewSet(viewsets.ModelViewSet):
    queryset = SolicitudDisponible.objects.all()
    serializer_class = SolicitudDisponibleSerializer


class AsignacionViewSet(viewsets.ModelViewSet):
    queryset = Asignacion.objects.all()
    serializer_class = AsignacionSerializer