from django.contrib import admin
from MyApps.tracking.models import UbicacionDomiciliario


class UbicacionDomiciliarioAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'asignacion',
        'latitudUbicacion',
        'longitudUbicacion',
        'fechaHoraUbicacion'
    )

    list_filter = (
        'fechaHoraUbicacion',
    )


admin.site.register(
    UbicacionDomiciliario,
    UbicacionDomiciliarioAdmin
)