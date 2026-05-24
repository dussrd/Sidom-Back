from rest_framework import viewsets
from MyApps.solicitudes.models import Solicitud
from MyApps.solicitudes.serializers import SolicitudSerializer


class SolicitudViewSet(viewsets.ModelViewSet):
    queryset = Solicitud.objects.all()
    serializer_class = SolicitudSerializer