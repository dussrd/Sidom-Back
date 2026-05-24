from django.contrib import admin
from MyApps.entregas.models import (
    HistorialEstadoEntrega,
    SeguimientoEntrega,
    Novedad
)


class NovedadInline(admin.TabularInline):
    model = Novedad
    extra = 1


class SeguimientoEntregaAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'asignacion',
        'fechaEstimadaSeguimiento',
        'cumplimientoSeguimiento'
    )

    inlines = (NovedadInline,)

    list_filter = (
        'cumplimientoSeguimiento',
    )


class HistorialEstadoEntregaAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'fechaCambioHistorial',
        'tipoEstado'
    )


class NovedadAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'fechaNovedad',
        'tipoNovedad',
        'tipoEstado'
    )


admin.site.register(
    HistorialEstadoEntrega,
    HistorialEstadoEntregaAdmin
)

admin.site.register(
    SeguimientoEntrega,
    SeguimientoEntregaAdmin
)

admin.site.register(
    Novedad,
    NovedadAdmin
)