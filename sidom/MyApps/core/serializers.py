from rest_framework import serializers
from MyApps.core.models import TipoMaestra


class TipoMaestraSerializer(serializers.ModelSerializer):

    class Meta:
        model = TipoMaestra
        fields = "__all__"

    def validate_nombreTipo(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("El nombre del tipo debe tener mínimo 3 caracteres")
        return value

    def validate_codigoTipo(self, value):
        if value and len(value) < 2:
            raise serializers.ValidationError("El código debe tener mínimo 2 caracteres")
        return value