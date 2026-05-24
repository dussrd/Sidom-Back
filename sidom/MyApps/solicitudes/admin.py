from django.contrib import admin
from MyApps.solicitudes.models import Solicitud


class SolicitudAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'cliente',
        'fechaSolicitud',
        'direccionEntregaSolicitud',
        'tipoEstado'
    )

    search_fields = (
        'cliente__nombresCliente',
        'cliente__apellidosCliente'
    )

    list_filter = (
        'tipoEstado',
        'tipoServicio'
    )


admin.site.register(Solicitud, SolicitudAdmin)