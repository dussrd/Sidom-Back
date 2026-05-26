from django.contrib import admin
from MyApps.usuarios.models import Cliente, Domiciliario, Usuario


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


class UsuarioAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'usernameUsuario',
        'tipoRol',
        'activoUsuario',
        'cliente',
        'domiciliario'
    )

    search_fields = (
        'usernameUsuario',
        'cliente__nombresCliente',
        'cliente__apellidosCliente',
        'domiciliario__nombresDomiciliario',
        'domiciliario__apellidosDomiciliario'
    )

    list_filter = (
        'activoUsuario',
        'tipoRol'
    )


admin.site.register(Cliente, ClienteAdmin)
admin.site.register(Domiciliario, DomiciliarioAdmin)
admin.site.register(Usuario, UsuarioAdmin)
