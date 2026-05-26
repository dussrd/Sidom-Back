from django.db import models


class TipoMaestra(models.Model):
    id = models.AutoField(
        primary_key=True,
        db_column="TIMA_ID"
    )

    nombreTipo = models.CharField(
        db_column="TIMA_NOMBRE",
        max_length=100,
        help_text="Ingrese el nombre del tipo"
    )

    codigoTipo = models.CharField(
        db_column="TIMA_CODIGO",
        max_length=30,
        unique=True,
        blank=True,
        null=True,
        help_text="Ingrese el código del tipo"
    )

    padreTipo = models.ForeignKey(
        "self",
        db_column="PADRE_ID",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="subtipos"
    )

    esTabla = models.BooleanField(
        db_column="IS_TABLA",
        default=False
    )

    def __str__(self):
        return self.nombreTipo

    @classmethod
    def por_codigo(cls, codigo):
        return cls.objects.filter(codigoTipo=codigo).first()

    class Meta:
        db_table = "TBL_TIPOS_MAESTRA"
        ordering = ["padreTipo_id", "nombreTipo"]
        verbose_name = "tipo maestro"
        verbose_name_plural = "tipos maestros"
