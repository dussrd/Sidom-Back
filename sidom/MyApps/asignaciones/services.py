from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from MyApps.asignaciones.models import Asignacion, SolicitudDisponible
from MyApps.core.services import obtener_tipo
from MyApps.entregas.models import HistorialEstadoEntrega, SeguimientoEntrega
from MyApps.solicitudes.models import Solicitud
from MyApps.usuarios.models import Domiciliario


ESTADOS_ENTREGA_ACTIVA = ["RECOGIDO", "EN_CAMINO", "CON_NOVEDAD"]


def asignaciones_activas_domiciliario(domiciliario):
    disponibles_aceptadas = Asignacion.objects.filter(
        solicitudDisponible__domiciliario=domiciliario,
        solicitudDisponible__tipoEstado__codigoTipo="ACEPTADA",
    )

    return disponibles_aceptadas.exclude(
        seguimientos__historialEstadoEntrega__tipoEstado__codigoTipo="ENTREGADO"
    ).distinct().count()


@transaction.atomic
def publicar_solicitud(solicitud):
    solicitud = Solicitud.objects.select_for_update().get(id=solicitud.id)

    if solicitud.tipoEstado.codigoTipo != "VALIDADA":
        raise ValidationError("Solo se pueden publicar solicitudes en estado VALIDADA.")

    existente = SolicitudDisponible.objects.filter(
        solicitud=solicitud,
        tipoEstado__codigoTipo__in=["PUBLICADA", "ACEPTADA"],
    ).first()
    if existente:
        return existente

    return SolicitudDisponible.objects.create(
        solicitud=solicitud,
        tipoEstado=obtener_tipo("PUBLICADA"),
    )


@transaction.atomic
def aceptar_solicitud(solicitud_disponible, domiciliario):
    disponible = SolicitudDisponible.objects.select_for_update().select_related(
        "solicitud",
        "tipoEstado",
    ).get(id=solicitud_disponible.id)
    domiciliario = Domiciliario.objects.select_for_update().get(id=domiciliario.id)

    if disponible.tipoEstado.codigoTipo != "PUBLICADA" or disponible.domiciliario_id:
        raise ValidationError("La solicitud ya fue aceptada o no está publicada.")

    if asignaciones_activas_domiciliario(domiciliario) >= 3:
        raise ValidationError("El domiciliario ya tiene 3 asignaciones activas.")

    disponible.domiciliario = domiciliario
    disponible.tipoEstado = obtener_tipo("ACEPTADA")
    disponible.fechaAceptacionSolicitudDisponible = timezone.now()
    disponible.save()

    asignacion, _ = Asignacion.objects.get_or_create(solicitudDisponible=disponible)

    solicitud = disponible.solicitud
    solicitud.tipoEstado = obtener_tipo("EN_PROCESO")
    solicitud.save(update_fields=["tipoEstado"])

    if not asignacion.seguimientos.exists():
        historial = HistorialEstadoEntrega.objects.create(
            tipoEstado=obtener_tipo("RECOGIDO"),
            observacionHistorial="Asignación aceptada; seguimiento iniciado.",
        )
        SeguimientoEntrega.objects.create(
            fechaEstimadaSeguimiento=timezone.now() + timedelta(minutes=60),
            asignacion=asignacion,
            historialEstadoEntrega=historial,
        )

    return asignacion
