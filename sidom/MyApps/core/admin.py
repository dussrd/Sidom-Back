from django.contrib import admin
from MyApps.core.models import TipoMaestra


class TipoMaestraAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nombreTipo',
        'codigoTipo',
        'esTabla'
    )

    search_fields = (
        'nombreTipo',
        'codigoTipo'
    )

    list_filter = (
        'esTabla',
    )


admin.site.register(TipoMaestra, TipoMaestraAdmin)