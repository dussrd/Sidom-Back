from rest_framework import serializers
from MyApps.solicitudes.models import Solicitud


class SolicitudSerializer(serializers.ModelSerializer):

    class Meta:
        model = Solicitud
        fields = "__all__"

    def validate_descripcionSolicitud(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("La descripción debe tener mínimo 10 caracteres")
        return value

    def validate_direccionEntregaSolicitud(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("La dirección de entrega es demasiado corta")
        return value

    def validate(self, data):
        recogida = data.get("direccionRecogidaSolicitud")
        entrega = data.get("direccionEntregaSolicitud")

        if recogida and recogida == entrega:
            raise serializers.ValidationError(
                "La dirección de recogida y entrega no pueden ser iguales"
            )

        return data