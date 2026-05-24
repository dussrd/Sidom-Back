from django.db import models
from MyApps.usuarios.models import Cliente
from MyApps.core.models import TipoMaestra


class Solicitud(models.Model):
    fechaSolicitud = models.DateField(
        auto_now_add=True,
        help_text="Fecha de creación de la solicitud"
    )

    descripcionSolicitud = models.CharField(
        max_length=300,
        help_text="Ingrese la descripción de la solicitud"
    )

    direccionRecogidaSolicitud = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Ingrese la dirección de recogida"
    )

    direccionEntregaSolicitud = models.CharField(
        max_length=200,
        help_text="Ingrese la dirección de entrega"
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="solicitudes"
    )

    tipoZona = models.ForeignKey(
        TipoMaestra,
        on_delete=models.PROTECT,
        related_name="zonas_solicitud"
    )

    tipoServicio = models.ForeignKey(
        TipoMaestra,
        on_delete=models.PROTECT,
        related_name="servicios_solicitud"
    )

    tipoEstado = models.ForeignKey(
        TipoMaestra,
        on_delete=models.PROTECT,
        related_name="estados_solicitud"
    )

    tipoMotivoRechazo = models.ForeignKey(
        TipoMaestra,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="motivos_rechazo_solicitud"
    )

    def __str__(self):
        return f"Solicitud #{self.id} - {self.cliente}"

    class Meta:
        verbose_name = "solicitud"
        verbose_name_plural = "solicitudes"