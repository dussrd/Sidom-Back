from rest_framework import viewsets

from MyApps.tracking.models import UbicacionDomiciliario
from MyApps.tracking.serializers import (
    UbicacionDomiciliarioSerializer
)


class UbicacionDomiciliarioViewSet(viewsets.ModelViewSet):
    queryset = UbicacionDomiciliario.objects.all()
    serializer_class = UbicacionDomiciliarioSerializer