from django.db import models
from django.core.validators import RegexValidator


class TipoMaestra(models.Model):
    nombreTipo = models.CharField(
        max_length=100,
        help_text="Ingrese el nombre del tipo"
    )

    codigoTipo = models.CharField(
        max_length=30,
        unique=True,
        blank=True,
        null=True,
        help_text="Ingrese el código del tipo"
    )

    padreTipo = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="subtipos"
    )

    esTabla = models.BooleanField(default=False)

    def __str__(self):
        return self.nombreTipo

    class Meta:
        verbose_name = "tipo maestro"
        verbose_name_plural = "tipos maestros"