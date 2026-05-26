from rest_framework import serializers
from MyApps.entregas.models import (
    HistorialEstadoEntrega,
    SeguimientoEntrega,
    Novedad
)


class HistorialEstadoEntregaSerializer(serializers.ModelSerializer):
    tipoEstadoCodigo = serializers.CharField(
        source="tipoEstado.codigoTipo",
        read_only=True
    )

    class Meta:
        model = HistorialEstadoEntrega
        fields = "__all__"

    def validate_observacionHistorial(self, value):
        if value and len(value) < 5:
            raise serializers.ValidationError("La observación debe tener mínimo 5 caracteres")
        return value


class SeguimientoEntregaSerializer(serializers.ModelSerializer):
    estadoActualCodigo = serializers.CharField(
        source="historialEstadoEntrega.tipoEstado.codigoTipo",
        read_only=True
    )

    class Meta:
        model = SeguimientoEntrega
        fields = "__all__"

    def validate(self, data):
        fecha_estimada = data.get("fechaEstimadaSeguimiento")
        fecha_real = data.get("fechaRealSeguimiento")

        return data


class NovedadSerializer(serializers.ModelSerializer):
    tipoNovedadCodigo = serializers.CharField(
        source="tipoNovedad.codigoTipo",
        read_only=True
    )
    tipoEstadoCodigo = serializers.CharField(
        source="tipoEstado.codigoTipo",
        read_only=True
    )

    class Meta:
        model = Novedad
        fields = "__all__"
        extra_kwargs = {
            "tipoEstado": {
                "required": False,
                "allow_null": True
            }
        }

    def validate_descripcionNovedad(self, value):
        if len(value) < 10:
            raise serializers.ValidationError(
                "La descripción de la novedad debe tener mínimo 10 caracteres"
            )
        return value

    def validate_solucionNovedad(self, value):
        if value and len(value) < 10:
            raise serializers.ValidationError(
                "La solución de la novedad debe tener mínimo 10 caracteres"
            )
        return value

    def create(self, validated_data):
        if not validated_data.get("tipoEstado"):
            validated_data["tipoEstado"] = validated_data["tipoNovedad"]
        return super().create(validated_data)
