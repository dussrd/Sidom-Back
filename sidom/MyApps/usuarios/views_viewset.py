from rest_framework import viewsets
from MyApps.usuarios.models import Cliente, Domiciliario
from MyApps.usuarios.serializers import (
    ClienteSerializer,
    DomiciliarioSerializer
)


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class DomiciliarioViewSet(viewsets.ModelViewSet):
    queryset = Domiciliario.objects.all()
    serializer_class = DomiciliarioSerializer