from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from MyApps.core.services import obtener_tipo
from MyApps.entregas.models import HistorialEstadoEntrega, Novedad, SeguimientoEntrega


def minutos_cumplimiento(seguimiento):
    referencia = seguimiento.fechaRealSeguimiento or timezone.now()
    return int((referencia - seguimiento.fechaEstimadaSeguimiento).total_seconds() // 60)


@transaction.atomic
def cambiar_estado_entrega(seguimiento, tipo_estado, observacion=None):
    historial = HistorialEstadoEntrega.objects.create(
        tipoEstado=tipo_estado,
        observacionHistorial=observacion,
    )

    seguimiento.historialEstadoEntrega = historial
    if tipo_estado.codigoTipo == "ENTREGADO":
        seguimiento.fechaRealSeguimiento = timezone.now()
        solicitud = seguimiento.asignacion.solicitudDisponible.solicitud
        solicitud.tipoEstado = obtener_tipo("ENTREGADA")
        solicitud.save(update_fields=["tipoEstado"])

    seguimiento.save()
    return seguimiento


@transaction.atomic
def marcar_entrega_con_novedad(novedad):
    seguimiento = SeguimientoEntrega.objects.select_for_update().get(
        id=novedad.seguimientoEntrega_id
    )
    estado_novedad = obtener_tipo("CON_NOVEDAD")
    historial = HistorialEstadoEntrega.objects.create(
        tipoEstado=estado_novedad,
        observacionHistorial=novedad.descripcionNovedad,
    )
    seguimiento.historialEstadoEntrega = historial
    seguimiento.save(update_fields=["historialEstadoEntrega", "cumplimientoSeguimiento"])
    return seguimiento


@transaction.atomic
def resolver_novedad(novedad, solucion):
    if not solucion or len(solucion.strip()) < 10:
        raise ValidationError("La solución es obligatoria y debe tener mínimo 10 caracteres.")

    if novedad.tipoEstado.codigoTipo == "RESUELTA":
        raise ValidationError("La novedad ya está resuelta.")

    novedad.solucionNovedad = solucion.strip()
    novedad.tipoEstado = obtener_tipo("RESUELTA")
    novedad.save(update_fields=["solucionNovedad", "tipoEstado"])
    return novedad


def novedades_pendientes_domiciliario(domiciliario):
    return Novedad.objects.filter(
        seguimientoEntrega__asignacion__solicitudDisponible__domiciliario=domiciliario,
    ).exclude(tipoEstado__codigoTipo="RESUELTA").count()
