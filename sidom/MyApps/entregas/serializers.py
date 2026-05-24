from rest_framework import serializers
from MyApps.entregas.models import (
    HistorialEstadoEntrega,
    SeguimientoEntrega,
    Novedad
)


class HistorialEstadoEntregaSerializer(serializers.ModelSerializer):

    class Meta:
        model = HistorialEstadoEntrega
        fields = "__all__"

    def validate_observacionHistorial(self, value):
        if value and len(value) < 5:
            raise serializers.ValidationError("La observación debe tener mínimo 5 caracteres")
        return value


class SeguimientoEntregaSerializer(serializers.ModelSerializer):

    class Meta:
        model = SeguimientoEntrega
        fields = "__all__"

    def validate(self, data):
        fecha_estimada = data.get("fechaEstimadaSeguimiento")
        fecha_real = data.get("fechaRealSeguimiento")

        if fecha_real and fecha_real < fecha_estimada:
            raise serializers.ValidationError(
                "La fecha real no puede ser menor que la fecha estimada"
            )

        return data


class NovedadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Novedad
        fields = "__all__"

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