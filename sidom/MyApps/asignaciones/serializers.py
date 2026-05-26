from rest_framework import serializers
from MyApps.asignaciones.models import SolicitudDisponible, Asignacion
from MyApps.core.services import obtener_tipo


class SolicitudDisponibleSerializer(serializers.ModelSerializer):
    tipoEstadoCodigo = serializers.CharField(
        source="tipoEstado.codigoTipo",
        read_only=True
    )

    class Meta:
        model = SolicitudDisponible
        fields = "__all__"
        extra_kwargs = {
            "tipoEstado": {
                "required": False,
                "allow_null": True
            }
        }

    def validate(self, data):
        fecha_aceptacion = data.get("fechaAceptacionSolicitudDisponible")
        domiciliario = data.get("domiciliario")

        if fecha_aceptacion and not domiciliario:
            raise serializers.ValidationError(
                "Si la solicitud fue aceptada, debe tener un domiciliario asignado"
            )

        return data

    def create(self, validated_data):
        if not validated_data.get("tipoEstado"):
            validated_data["tipoEstado"] = obtener_tipo("PUBLICADA")
        return super().create(validated_data)


class AsignacionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Asignacion
        fields = "__all__"

    def validate_solicitudDisponible(self, value):
        if hasattr(value, "asignacion"):
            raise serializers.ValidationError(
                "Esta solicitud disponible ya tiene una asignación"
            )
        return value
