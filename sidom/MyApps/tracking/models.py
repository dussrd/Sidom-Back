from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from MyApps.asignaciones.models import Asignacion


class UbicacionDomiciliario(models.Model):
    id = models.AutoField(
        primary_key=True,
        db_column="UBIC_ID"
    )

    latitudUbicacion = models.DecimalField(
        db_column="UBIC_LATITUD",
        max_digits=10,
        decimal_places=8,
        validators=[
            MinValueValidator(-90),
            MaxValueValidator(90)
        ],
        help_text="Ingrese la latitud"
    )

    longitudUbicacion = models.DecimalField(
        db_column="UBIC_LONGITUD",
        max_digits=11,
        decimal_places=8,
        validators=[
            MinValueValidator(-180),
            MaxValueValidator(180)
        ],
        help_text="Ingrese la longitud"
    )

    fechaHoraUbicacion = models.DateTimeField(
        db_column="UBIC_FECHA_HORA",
        auto_now_add=True
    )

    asignacion = models.ForeignKey(
        Asignacion,
        db_column="ASIG_ID",
        on_delete=models.CASCADE,
        related_name="ubicaciones"
    )

    def __str__(self):
        return f"Ubicación #{self.id}"

    class Meta:
        db_table = "TBL_UBICACIONES_DOMICILIARIO"
        verbose_name = "ubicación domiciliario"
        verbose_name_plural = "ubicaciones domiciliarios"
        ordering = ["-fechaHoraUbicacion"]
