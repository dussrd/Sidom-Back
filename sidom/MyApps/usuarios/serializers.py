from rest_framework import serializers
from MyApps.usuarios.models import Cliente, Domiciliario


class ClienteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Cliente
        fields = "__all__"
        extra_kwargs = {
            "passwordCliente": {
                "write_only": True
            }
        }

    def validate_nombresCliente(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("El nombre no puede ser tan corto")
        return value

    def validate_apellidosCliente(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("El apellido no puede ser tan corto")
        return value

    def validate_passwordCliente(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("El password debe tener mínimo 8 caracteres")
        return value

    def validate_telefonoCliente(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("El teléfono solo debe contener números")
        return value

    def validate_identificacionCliente(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("La identificación solo debe contener números")
        return value
    
    def validate_correoCliente(self, value):
        if "@" not in value:
            raise serializers.ValidationError("Ingrese un correo válido")
        return value
    

class DomiciliarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Domiciliario
        fields = "__all__"

    def validate_nombresDomiciliario(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("El nombre no puede ser tan corto")
        return value

    def validate_apellidosDomiciliario(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("El apellido no puede ser tan corto")
        return value

    def validate_telefonoDomiciliario(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("El teléfono solo debe contener números")
        return value

    def validate_identificacionDomiciliario(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("La identificación solo debe contener números")
        return value

    def validate_placaDomiciliario(self, value):
        value = value.upper()

        if len(value) != 6:
            raise serializers.ValidationError("La placa debe tener 6 caracteres")

        if not value[:3].isalpha() or not value[3:].isdigit():
            raise serializers.ValidationError("La placa debe tener el formato ABC123")

        return value