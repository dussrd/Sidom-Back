from django.db import models
from MyApps.asignaciones.models import Asignacion
from MyApps.core.models import TipoMaestra


class HistorialEstadoEntrega(models.Model):
    fechaCambioHistorial = models.DateTimeField(
        auto_now_add=True
    )

    observacionHistorial = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        help_text="Ingrese una observación"
    )

    tipoEstado = models.ForeignKey(
        TipoMaestra,
        on_delete=models.PROTECT,
        related_name="estados_historial_entrega"
    )

    def __str__(self):
        return f"Historial #{self.id}"

    class Meta:
        verbose_name = "historial estado entrega"
        verbose_name_plural = "historial estados entrega"


class SeguimientoEntrega(models.Model):
    CUMPLIMIENTO_CHOICES = [
        ("PENDIENTE", "Pendiente"),
        ("CUMPLIDO", "Cumplido"),
        ("INCUMPLIDO", "Incumplido"),
    ]

    fechaEstimadaSeguimiento = models.DateTimeField(
        help_text="Ingrese la fecha estimada de entrega"
    )

    fechaRealSeguimiento = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Ingrese la fecha real de entrega"
    )

    cumplimientoSeguimiento = models.CharField(
        max_length=20,
        choices=CUMPLIMIENTO_CHOICES,
        default="PENDIENTE"
    )

    asignacion = models.ForeignKey(
        Asignacion,
        on_delete=models.PROTECT,
        related_name="seguimientos"
    )

    historialEstadoEntrega = models.ForeignKey(
        HistorialEstadoEntrega,
        on_delete=models.PROTECT,
        related_name="seguimientos"
    )

    def __str__(self):
        return f"Seguimiento #{self.id}"

    class Meta:
        verbose_name = "seguimiento entrega"
        verbose_name_plural = "seguimientos entrega"


class Novedad(models.Model):
    fechaNovedad = models.DateField(
        auto_now_add=True
    )

    descripcionNovedad = models.CharField(
        max_length=300,
        help_text="Ingrese la descripción de la novedad"
    )

    solucionNovedad = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        help_text="Ingrese la solución de la novedad"
    )

    seguimientoEntrega = models.ForeignKey(
        SeguimientoEntrega,
        on_delete=models.CASCADE,
        related_name="novedades"
    )

    tipoNovedad = models.ForeignKey(
        TipoMaestra,
        on_delete=models.PROTECT,
        related_name="tipos_novedad"
    )

    tipoEstado = models.ForeignKey(
        TipoMaestra,
        on_delete=models.PROTECT,
        related_name="estados_novedad"
    )

    def __str__(self):
        return f"Novedad #{self.id}"

    class Meta:
        verbose_name = "novedad"
        verbose_name_plural = "novedades"