from django.core.management.base import BaseCommand

from MyApps.core.services import crear_catalogos_iniciales


class Command(BaseCommand):
    help = "Crea los catálogos iniciales de SIDOM en TBL_TIPOS_MAESTRA."

    def handle(self, *args, **options):
        creados = crear_catalogos_iniciales()
        self.stdout.write(self.style.SUCCESS(f"Catálogos SIDOM listos. Registros creados: {creados}"))
