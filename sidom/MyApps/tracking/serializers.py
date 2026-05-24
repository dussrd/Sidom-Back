from rest_framework import serializers
from MyApps.tracking.models import UbicacionDomiciliario


class UbicacionDomiciliarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = UbicacionDomiciliario
        fields = "__all__"

    def validate_latitudUbicacion(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError("La latitud debe estar entre -90 y 90")
        return value

    def validate_longitudUbicacion(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError("La longitud debe estar entre -180 y 180")
        return value