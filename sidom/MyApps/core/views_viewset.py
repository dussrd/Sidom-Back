from rest_framework import viewsets
from MyApps.core.models import TipoMaestra
from MyApps.core.serializers import TipoMaestraSerializer


class TipoMaestraViewSet(viewsets.ModelViewSet):
    queryset = TipoMaestra.objects.all()
    serializer_class = TipoMaestraSerializer