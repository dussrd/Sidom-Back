import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal, ViewChild, ElementRef } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { SlicePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import * as L from 'leaflet';
import { TrackingService } from '../../core/services/tracking.service';
import { AsignacionService } from '../../core/services/asignacion.service';
import { DomiciliarioService } from '../../core/services/domiciliario.service';
import { UbicacionDomiciliario } from '../../core/models/tracking.model';
import { UbicacionDialogComponent } from './ubicacion-dialog';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    SlicePipe,
  ],
  templateUrl: './tracking.html',
  styleUrl: './tracking.css',
})
export class TrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  private service         = inject(TrackingService);
  private asignSvc        = inject(AsignacionService);
  private domiciliarioSvc = inject(DomiciliarioService);
  private dialog          = inject(MatDialog);
  private snack           = inject(MatSnackBar);

  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;
  @ViewChild(MatPaginator) set pag(p: MatPaginator) { this.dataSource.paginator = p; }

  loading      = signal(true);
  mapReady     = false;
  dataSource   = new MatTableDataSource<UbicacionDomiciliario>([]);
  displayedColumns = ['id', 'asignacion', 'latitud', 'longitud', 'fecha', 'acciones'];

  asignacionesMap  = new Map<number, string>();
  private map!: L.Map;
  private markers: L.CircleMarker[] = [];

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    // mapa se inicializa después de que los datos carguen
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  load() {
    this.loading.set(true);
    forkJoin({
      ubicaciones:   this.service.getAll(),
      asignaciones:  this.asignSvc.getAllAsignaciones(),
      domiciliarios: this.domiciliarioSvc.getAll(),
    }).subscribe({
      next: ({ ubicaciones, asignaciones, domiciliarios }) => {
        const dMap = new Map<number, string>();
        domiciliarios.forEach(d => dMap.set(d.id!, `${d.nombresDomiciliario} ${d.apellidosDomiciliario}`));
        asignaciones.forEach(a => this.asignacionesMap.set(a.id!, `Asig. #${a.id}`));
        this.dataSource.data = ubicaciones;
        this.loading.set(false);

        // Inicializar o actualizar mapa después del render
        setTimeout(() => this.initOrUpdateMap(ubicaciones), 100);
      },
      error: () => {
        this.snack.open('Error al cargar ubicaciones', 'Cerrar', { duration: 3000, panelClass: 'snack-error' });
        this.loading.set(false);
      },
    });
  }

  getAsignacion(id: number) { return this.asignacionesMap.get(id) || `Asig. #${id}`; }

  private initOrUpdateMap(ubicaciones: UbicacionDomiciliario[]) {
    if (!this.mapEl) return;

    if (!this.map) {
      // Colombia: centro aproximado
      this.map = L.map(this.mapEl.nativeElement).setView([4.5709, -74.2973], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(this.map);
      this.mapReady = true;
    }

    // Limpiar marcadores anteriores
    this.markers.forEach(m => m.remove());
    this.markers = [];

    if (ubicaciones.length === 0) return;

    const bounds: L.LatLngTuple[] = [];

    ubicaciones.forEach(u => {
      const lat = Number(u.latitudUbicacion);
      const lng = Number(u.longitudUbicacion);
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: '#1565c0',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      });

      marker.bindPopup(`
        <div style="font-family:Roboto,sans-serif;min-width:180px">
          <strong style="color:#1565c0">📍 ${this.getAsignacion(u.asignacion)}</strong><br/>
          <table style="margin-top:6px;font-size:12px;border-collapse:collapse">
            <tr><td style="color:#666;padding-right:8px">Latitud:</td><td><b>${lat}</b></td></tr>
            <tr><td style="color:#666">Longitud:</td><td><b>${lng}</b></td></tr>
            ${u.fechaHoraUbicacion ? `<tr><td style="color:#666">Fecha:</td><td>${String(u.fechaHoraUbicacion).substring(0, 16)}</td></tr>` : ''}
          </table>
        </div>
      `);

      marker.addTo(this.map);
      this.markers.push(marker);
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }

  openDialog(item?: UbicacionDomiciliario) {
    this.dialog.open(UbicacionDialogComponent, { data: item ?? null, width: '540px' })
      .afterClosed().subscribe(r => { if (r) this.load(); });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar esta ubicación?')) return;
    this.service.del(id).subscribe({
      next: () => { this.snack.open('Eliminado', 'OK', { duration: 2000, panelClass: 'snack-success' }); this.load(); },
      error: () => this.snack.open('Error al eliminar', 'Cerrar', { duration: 3000, panelClass: 'snack-error' }),
    });
  }
}
