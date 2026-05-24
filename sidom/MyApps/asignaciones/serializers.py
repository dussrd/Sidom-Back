from rest_framework import serializers
from MyApps.asignaciones.models import SolicitudDisponible, Asignacion


class SolicitudDisponibleSerializer(serializers.ModelSerializer):

    class Meta:
        model = SolicitudDisponible
        fields = "__all__"

    def validate(self, data):
        fecha_aceptacion = data.get("fechaAceptacionSolicitudDisponible")
        domiciliario = data.get("domiciliario")

        if fecha_aceptacion and not domiciliario:
            raise serializers.ValidationError(
                "Si la solicitud fue aceptada, debe tener un domiciliario asignado"
            )

        return data


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