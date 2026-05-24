from django.contrib import admin
from MyApps.usuarios.models import Cliente, Domiciliario


class ClienteAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nombresCliente',
        'apellidosCliente',
        'telefonoCliente',
        'correoCliente'
    )

    search_fields = (
        'nombresCliente',
        'apellidosCliente',
        'correoCliente'
    )


class DomiciliarioAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nombresDomiciliario',
        'apellidosDomiciliario',
        'telefonoDomiciliario',
        'placaDomiciliario'
    )

    search_fields = (
        'nombresDomiciliario',
        'apellidosDomiciliario',
        'placaDomiciliario'
    )


admin.site.register(Cliente, ClienteAdmin)
admin.site.register(Domiciliario, DomiciliarioAdmin)