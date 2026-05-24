from django.contrib import admin
from MyApps.asignaciones.models import (
    SolicitudDisponible,
    Asignacion
)


class AsignacionInline(admin.TabularInline):
    model = Asignacion
    extra = 1


class SolicitudDisponibleAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'solicitud',
        'domiciliario',
        'tipoEstado'
    )

    inlines = (AsignacionInline,)

    list_filter = (
        'tipoEstado',
    )


class AsignacionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'fechaAsignacion',
        'solicitudDisponible'
    )


admin.site.register(SolicitudDisponible, SolicitudDisponibleAdmin)
admin.site.register(Asignacion, AsignacionAdmin)