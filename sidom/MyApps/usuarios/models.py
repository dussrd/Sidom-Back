from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from django.core.exceptions import ValidationError


solo_numeros = RegexValidator(
    regex=r"^\d+$",
    message="Este campo solo debe contener números."
)

placa_validator = RegexValidator(
    regex=r"^[A-Z]{3}[0-9]{3}$",
    message="La placa debe tener el formato ABC123."
)


class Cliente(models.Model):
    identificacionCliente = models.CharField(
        max_length=20,
        unique=True,
        validators=[solo_numeros],
        help_text="Ingrese la identificación del cliente"
    )

    nombresCliente = models.CharField(
        max_length=100,
        help_text="Ingrese los nombres del cliente"
    )

    apellidosCliente = models.CharField(
        max_length=100,
        help_text="Ingrese los apellidos del cliente"
    )

    telefonoCliente = models.CharField(
        max_length=12,
        validators=[solo_numeros],
        help_text="Ingrese el teléfono del cliente"
    )

    correoCliente = models.EmailField(
        max_length=100,
        unique=True,
        help_text="Ingrese el correo del cliente"
    )

    direccionCliente = models.CharField(
        max_length=200,
        help_text="Ingrese la dirección del cliente"
    )

    passwordCliente = models.CharField(
        max_length=100,
        help_text="Ingrese el password del cliente"
    )

    def __str__(self):
        return f"{self.nombresCliente} {self.apellidosCliente}"

    class Meta:
        verbose_name = "cliente"
        verbose_name_plural = "clientes"


class Domiciliario(models.Model):
    identificacionDomiciliario = models.CharField(
        max_length=20,
        unique=True,
        validators=[solo_numeros],
        help_text="Ingrese la identificación del domiciliario"
    )

    nombresDomiciliario = models.CharField(
        max_length=100,
        help_text="Ingrese los nombres del domiciliario"
    )

    apellidosDomiciliario = models.CharField(
        max_length=100,
        help_text="Ingrese los apellidos del domiciliario"
    )

    telefonoDomiciliario = models.CharField(
        max_length=12,
        validators=[solo_numeros],
        help_text="Ingrese el teléfono del domiciliario"
    )

    tipoVehiculoDomiciliario = models.CharField(
        max_length=50,
        help_text="Ingrese el tipo de vehículo"
    )

    placaDomiciliario = models.CharField(
        max_length=6,
        unique=True,
        validators=[placa_validator],
        help_text="Ingrese la placa del vehículo"
    )

    def __str__(self):
        return f"{self.nombresDomiciliario} {self.apellidosDomiciliario}"

    class Meta:
        verbose_name = "domiciliario"
        verbose_name_plural = "domiciliarios"