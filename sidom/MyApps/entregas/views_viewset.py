from datetime import datetime, time

from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

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
from MyApps.core.models import TipoMaestra
from MyApps.entregas.services import (
    cambiar_estado_entrega,
    marcar_entrega_con_novedad,
    minutos_cumplimiento,
    resolver_novedad,
)


class HistorialEstadoEntregaViewSet(viewsets.ModelViewSet):
    queryset = HistorialEstadoEntrega.objects.select_related("tipoEstado")
    serializer_class = HistorialEstadoEntregaSerializer


class SeguimientoEntregaViewSet(viewsets.ModelViewSet):
    queryset = SeguimientoEntrega.objects.select_related(
        "asignacion",
        "asignacion__solicitudDisponible",
        "asignacion__solicitudDisponible__domiciliario",
        "historialEstadoEntrega",
        "historialEstadoEntrega__tipoEstado",
    )
    serializer_class = SeguimientoEntregaSerializer

    @action(detail=True, methods=["post"], url_path="cambiar-estado")
    def cambiar_estado(self, request, pk=None):
        tipo_estado_id = request.data.get("tipoEstado")
        tipo_estado = TipoMaestra.objects.filter(id=tipo_estado_id).first()
        if not tipo_estado:
            return Response({"detail": "Estado no encontrado."}, status=404)

        seguimiento = cambiar_estado_entrega(
            self.get_object(),
            tipo_estado,
            request.data.get("observacion"),
        )
        return Response(self.get_serializer(seguimiento).data)

    @action(detail=True, methods=["get"], url_path="minutos-cumplimiento")
    def minutos(self, request, pk=None):
        seguimiento = self.get_object()
        return Response({
            "seguimiento": seguimiento.id,
            "minutosCumplimiento": minutos_cumplimiento(seguimiento),
        })

    @action(detail=False, methods=["get"], url_path="tiempo-real")
    def tiempo_real(self, request):
        data = []
        for seguimiento in self.get_queryset():
            asignacion = seguimiento.asignacion
            disponible = asignacion.solicitudDisponible
            ultima = asignacion.ubicaciones.order_by("-fechaHoraUbicacion").first()
            data.append({
                "seguimiento": seguimiento.id,
                "asignacion": asignacion.id,
                "domiciliario": disponible.domiciliario_id,
                "cliente": disponible.solicitud.cliente_id,
                "direccionEntrega": disponible.solicitud.direccionEntregaSolicitud,
                "estadoActual": seguimiento.historialEstadoEntrega.tipoEstado.codigoTipo,
                "cumplimiento": seguimiento.cumplimientoSeguimiento,
                "minutosCumplimiento": minutos_cumplimiento(seguimiento),
                "ultimaLatitud": ultima.latitudUbicacion if ultima else None,
                "ultimaLongitud": ultima.longitudUbicacion if ultima else None,
                "ultimaFechaHora": ultima.fechaHoraUbicacion if ultima else None,
            })
        return Response(data)


class NovedadViewSet(viewsets.ModelViewSet):
    queryset = Novedad.objects.select_related(
        "seguimientoEntrega",
        "tipoNovedad",
        "tipoEstado",
    )
    serializer_class = NovedadSerializer

    def perform_create(self, serializer):
        novedad = serializer.save()
        marcar_entrega_con_novedad(novedad)

    @action(detail=True, methods=["post"])
    def resolver(self, request, pk=None):
        novedad = resolver_novedad(self.get_object(), request.data.get("solucion"))
        return Response(self.get_serializer(novedad).data)

    @action(detail=False, methods=["get"], url_path="sin-resolver")
    def sin_resolver(self, request):
        qs = self.get_queryset().exclude(tipoEstado__codigoTipo="RESUELTA")
        data = []
        for novedad in qs:
            minutos = 0
            if novedad.fechaNovedad:
                inicio = timezone.make_aware(
                    datetime.combine(novedad.fechaNovedad, time.min),
                    timezone.get_current_timezone(),
                )
                minutos = int((timezone.now() - inicio).total_seconds() // 60)

            prioridad = "NORMAL"
            if minutos > 60:
                prioridad = "CRITICA"
            elif minutos > 30:
                prioridad = "URGENTE"

            item = self.get_serializer(novedad).data
            item["minutosSinResolver"] = minutos
            item["prioridad"] = prioridad
            data.append(item)
        return Response(data)
