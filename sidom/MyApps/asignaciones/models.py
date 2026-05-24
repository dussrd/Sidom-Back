from django.db import models
from MyApps.usuarios.models import Domiciliario
from MyApps.solicitudes.models import Solicitud
from MyApps.core.models import TipoMaestra


class SolicitudDisponible(models.Model):
    fechaPublicacionSolicitudDisponible = models.DateTimeField(
        auto_now_add=True
    )

    fechaAceptacionSolicitudDisponible = models.DateTimeField(
        blank=True,
        null=True
    )

    solicitud = models.ForeignKey(
        Solicitud,
        on_delete=models.CASCADE,
        related_name="disponibles"
    )

    domiciliario = models.ForeignKey(
        Domiciliario,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="solicitudes_aceptadas"
    )

    tipoEstado = models.ForeignKey(
        TipoMaestra,
        on_delete=models.PROTECT,
        related_name="estados_solicitud_disponible"
    )

    def __str__(self):
        return f"Solicitud disponible #{self.id}"

    class Meta:
        verbose_name = "solicitud disponible"
        verbose_name_plural = "solicitudes disponibles"


class Asignacion(models.Model):
    fechaAsignacion = models.DateField(
        auto_now_add=True
    )

    solicitudDisponible = models.OneToOneField(
        SolicitudDisponible,
        on_delete=models.PROTECT,
        related_name="asignacion"
    )

    def __str__(self):
        return f"Asignación #{self.id}"

    class Meta:
        verbose_name = "asignación"
        verbose_name_plural = "asignaciones"