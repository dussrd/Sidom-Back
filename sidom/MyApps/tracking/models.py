from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from MyApps.asignaciones.models import Asignacion


class UbicacionDomiciliario(models.Model):
    latitudUbicacion = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        validators=[
            MinValueValidator(-90),
            MaxValueValidator(90)
        ],
        help_text="Ingrese la latitud"
    )

    longitudUbicacion = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        validators=[
            MinValueValidator(-180),
            MaxValueValidator(180)
        ],
        help_text="Ingrese la longitud"
    )

    fechaHoraUbicacion = models.DateTimeField(
        auto_now_add=True
    )

    asignacion = models.ForeignKey(
        Asignacion,
        on_delete=models.CASCADE,
        related_name="ubicaciones"
    )

    def __str__(self):
        return f"Ubicación #{self.id}"

    class Meta:
        verbose_name = "ubicación domiciliario"
        verbose_name_plural = "ubicaciones domiciliarios"
        ordering = ["-fechaHoraUbicacion"]