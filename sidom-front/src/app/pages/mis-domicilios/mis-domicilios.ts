import { Component, inject, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import * as L from 'leaflet';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { AsignacionService } from '../../core/services/asignacion.service';
import { DomiciliarioService } from '../../core/services/domiciliario.service';
import { TipoMaestraService } from '../../core/services/tipo-maestra.service';
import { TrackingService } from '../../core/services/tracking.service';
import { Solicitud } from '../../core/models/solicitud.model';
import { Domiciliario } from '../../core/models/domiciliario.model';
import { PedidoDialogComponent } from './pedido-dialog';

export interface DomicilioCard {
  solicitud: Solicitud;
  domiciliario: Domiciliario | null;
  estadoCodigo: string;
  estadoNombre: string;
  fechaAsignacion: string;
  ultimaUbicacion: { lat: number; lng: number; hora: string } | null;
  tipoServicioNombre: string;
  tipoZonaNombre: string;
}

const TIMELINE: { codigo: string; label: string; icon: string }[] = [
  { codigo: 'PENDIENTE',  label: 'Pendiente',  icon: 'hourglass_empty' },
  { codigo: 'VALIDADA',   label: 'Validada',   icon: 'verified'        },
  { codigo: 'EN_PROCESO', label: 'En camino',  icon: 'delivery_dining' },
  { codigo: 'ENTREGADA',  label: 'Entregado',  icon: 'check_circle'    },
];

@Component({
  selector: 'app-mis-domicilios',
  imports: [MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  templateUrl: './mis-domicilios.html',
  styleUrl: './mis-domicilios.css',
})
export class MisDomiciliosComponent implements OnInit, AfterViewInit, OnDestroy {
  private auth         = inject(AuthService);
  private solicitudSvc = inject(SolicitudService);
  private asignSvc     = inject(AsignacionService);
  private domSvc       = inject(DomiciliarioService);
  private tipoSvc      = inject(TipoMaestraService);
  private trackingSvc  = inject(TrackingService);
  private dialog       = inject(MatDialog);

  @ViewChild('mapEl') mapEl!: ElementRef;

  loading  = signal(true);
  cards    = signal<DomicilioCard[]>([]);
  selected = signal<DomicilioCard | null>(null);
  timeline = TIMELINE;

  private map: L.Map | null = null;
  private mapReady = false;
  private pendingCards: DomicilioCard[] = [];

  ngOnInit()       { this.load(); }
  ngAfterViewInit(){ this.mapReady = true; if (this.pendingCards.length) this.renderMap(this.pendingCards); }
  ngOnDestroy()    { this.map?.remove(); this.map = null; }

  load() {
    const entityId = this.auth.currentUser()?.entityId;
    this.loading.set(true);

    forkJoin({
      solicitudes:   this.solicitudSvc.getAll(),
      disponibles:   this.asignSvc.getAllDisponibles(),
      asignaciones:  this.asignSvc.getAllAsignaciones(),
      domiciliarios: this.domSvc.getAll(),
      tipos:         this.tipoSvc.getAll(),
      ubicaciones:   this.trackingSvc.getAll(),
    }).subscribe({
      next: ({ solicitudes, disponibles, asignaciones, domiciliarios, tipos, ubicaciones }) => {
        const tiposMap  = new Map(tipos.map(t => [t.id!, t]));
        const codigoMap = new Map(tipos.map(t => [t.id!, t.codigoTipo ?? '']));
        const domMap    = new Map(domiciliarios.map(d => [d.id!, d]));

        const misSolicitudes = this.auth.isAdmin()
          ? solicitudes
          : solicitudes.filter(s => s.cliente === entityId);

        const misSolicitudIds  = new Set(misSolicitudes.map(s => s.id!));
        const misDisponibles   = disponibles.filter(d => misSolicitudIds.has(d.solicitud));
        const misDispIds       = new Set(misDisponibles.map(d => d.id!));
        const misAsignaciones  = asignaciones.filter(a => misDispIds.has(a.solicitudDisponible));
        const misAsignIds      = new Set(misAsignaciones.map(a => a.id!));

        // Última ubicación por asignacion
        const ultimaUbicMap = new Map<number, { lat: number; lng: number; hora: string }>();
        [...ubicaciones]
          .filter(u => misAsignIds.has(u.asignacion))
          .sort((a, b) => (a.fechaHoraUbicacion ?? '').localeCompare(b.fechaHoraUbicacion ?? ''))
          .forEach(u => ultimaUbicMap.set(u.asignacion, {
            lat: parseFloat(u.latitudUbicacion as any),
            lng: parseFloat(u.longitudUbicacion as any),
            hora: u.fechaHoraUbicacion ?? '',
          }));

        const built: DomicilioCard[] = misSolicitudes.map(sol => {
          const disp = misDisponibles.find(d => d.solicitud === sol.id);
          const asig = disp ? misAsignaciones.find(a => a.solicitudDisponible === disp.id) : null;
          const uloc = asig ? (ultimaUbicMap.get(asig.id!) ?? null) : null;
          const dom  = disp?.domiciliario ? (domMap.get(disp.domiciliario) ?? null) : null;
          const estadoCodigo = codigoMap.get(sol.tipoEstado ?? 0) ?? '';
          const estadoNombre = tiposMap.get(sol.tipoEstado ?? 0)?.nombreTipo ?? 'Sin estado';

          return {
            solicitud: sol,
            domiciliario: dom,
            estadoCodigo,
            estadoNombre,
            fechaAsignacion: asig?.fechaAsignacion ?? '',
            ultimaUbicacion: uloc,
            tipoServicioNombre: tiposMap.get(sol.tipoServicio)?.nombreTipo ?? '',
            tipoZonaNombre:     tiposMap.get(sol.tipoZona)?.nombreTipo ?? '',
          };
        });

        this.cards.set(built);
        this.selected.set(built.find(c => c.ultimaUbicacion) ?? built[0] ?? null);
        this.loading.set(false);

        if (this.mapReady) this.renderMap(built);
        else this.pendingCards = built;
      },
      error: () => this.loading.set(false),
    });
  }

  selectCard(card: DomicilioCard) {
    this.selected.set(card);
    if (card.ultimaUbicacion && this.map) {
      this.map.setView([card.ultimaUbicacion.lat, card.ultimaUbicacion.lng], 14);
    }
  }

  openPedido() {
    this.dialog.open(PedidoDialogComponent, { width: '560px', disableClose: true })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }

  timelineStep(card: DomicilioCard, codigo: string): 'done' | 'active' | 'pending' {
    const order = ['PENDIENTE', 'VALIDADA', 'EN_PROCESO', 'ENTREGADA'];
    const cardIdx = order.indexOf(card.estadoCodigo);
    const stepIdx = order.indexOf(codigo);
    if (card.estadoCodigo === 'RECHAZADA') return stepIdx === 0 ? 'active' : 'pending';
    if (stepIdx < cardIdx)  return 'done';
    if (stepIdx === cardIdx) return 'active';
    return 'pending';
  }

  isRechazada(card: DomicilioCard) { return card.estadoCodigo === 'RECHAZADA'; }

  formatHora(iso: string): string {
    if (!iso) return 'N/D';
    return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  }

  serviceIcon(servicio: string): string {
    const s = servicio.toLowerCase();
    if (s.includes('comida'))       return 'restaurant';
    if (s.includes('farmacia'))     return 'local_pharmacy';
    if (s.includes('super'))        return 'shopping_cart';
    if (s.includes('mensaj'))       return 'mail';
    return 'store';
  }

  badgeClass(codigo: string): string {
    if (codigo === 'ENTREGADA')  return 'badge success';
    if (codigo === 'EN_PROCESO') return 'badge info';
    if (codigo === 'VALIDADA')   return 'badge warning';
    if (codigo === 'RECHAZADA')  return 'badge danger';
    return 'badge neutral';
  }

  private renderMap(cards: DomicilioCard[]) {
    if (!this.mapEl?.nativeElement) return;

    if (!this.map) {
      this.map = L.map(this.mapEl.nativeElement).setView([10.4, -75.5], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);
    } else {
      this.map.eachLayer(l => { if (!(l instanceof L.TileLayer)) this.map!.removeLayer(l); });
    }

    const puntos: L.LatLngTuple[] = [];

    cards.forEach(card => {
      if (!card.ultimaUbicacion) return;
      const { lat, lng, hora } = card.ultimaUbicacion;
      const nombre = card.domiciliario
        ? `${card.domiciliario.nombresDomiciliario} ${card.domiciliario.apellidosDomiciliario}`
        : 'Domiciliario';
      const placa  = card.domiciliario?.placaDomiciliario ?? '';
      const vehic  = card.domiciliario?.tipoVehiculoDomiciliario ?? '';

      L.circleMarker([lat, lng], {
        radius: 13, fillColor: '#1565c0', color: '#fff', weight: 3, fillOpacity: 0.95,
      }).addTo(this.map!).bindPopup(`
        <div style="min-width:180px">
          <strong style="font-size:14px">🛵 ${nombre}</strong><br>
          <small>${vehic} · ${placa}</small><br>
          <hr style="margin:6px 0;border-color:#eee">
          <small>📦 ${card.solicitud.descripcionSolicitud.substring(0, 50)}</small><br>
          <small>📍 Destino: ${card.solicitud.direccionEntregaSolicitud}</small><br>
          <small>🕐 ${hora ? new Date(hora).toLocaleString('es-CO') : 'N/D'}</small>
        </div>
      `);
      puntos.push([lat, lng]);
    });

    if (puntos.length === 1)
      this.map!.setView(puntos[0], 14);
    else if (puntos.length > 1)
      this.map!.fitBounds(L.latLngBounds(puntos), { padding: [50, 50] });
  }
}
