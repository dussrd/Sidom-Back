import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { SlicePipe } from '@angular/common';
import { AsignacionService } from '../../core/services/asignacion.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { DomiciliarioService } from '../../core/services/domiciliario.service';
import { TipoMaestraService } from '../../core/services/tipo-maestra.service';
import { AuthService } from '../../core/services/auth.service';
import { SolicitudDisponible, Asignacion } from '../../core/models/asignacion.model';
import { DisponibleDialogComponent } from './disponible-dialog';
import { AsignacionDialogComponent } from './asignacion-dialog';

@Component({
  selector: 'app-asignaciones',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatTabsModule, SlicePipe],
  templateUrl: './asignaciones.html',
})
export class AsignacionesComponent implements OnInit {
  private service        = inject(AsignacionService);
  private solicitudSvc   = inject(SolicitudService);
  private domiciliarioSvc = inject(DomiciliarioService);
  private tipoSvc        = inject(TipoMaestraService);
  private authSvc        = inject(AuthService);
  private dialog         = inject(MatDialog);
  private snack          = inject(MatSnackBar);

  isAdmin        = this.authSvc.isAdmin();
  isDomiciliario = this.authSvc.isDomiciliario();

  loading      = signal(true);
  dsDisponible = new MatTableDataSource<SolicitudDisponible>([]);
  dsAsignacion = new MatTableDataSource<Asignacion>([]);

  colsDisponible  = ['id', 'solicitud', 'domiciliario', 'estado', 'fecha', 'acciones'];
  colsAsignacion  = ['id', 'solicitudDisponible', 'fechaAsignacion', 'acciones'];

  solicitudesMap   = new Map<number, string>();
  domiciliariosMap = new Map<number, string>();
  tiposMap         = new Map<number, string>();
  tiposCodigoMap   = new Map<number, string>();
  disponiblesMap   = new Map<number, string>();

  @ViewChild(MatSort)    set sort(s: MatSort)       { this.dsDisponible.sort = s; }
  @ViewChild(MatPaginator) set pag(p: MatPaginator) { this.dsDisponible.paginator = p; }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    forkJoin({
      disponibles:   this.service.getAllDisponibles(),
      asignaciones:  this.service.getAllAsignaciones(),
      solicitudes:   this.solicitudSvc.getAll(),
      domiciliarios: this.domiciliarioSvc.getAll(),
      tipos:         this.tipoSvc.getAll(),
    }).subscribe({
      next: ({ disponibles, asignaciones, solicitudes, domiciliarios, tipos }) => {
        solicitudes.forEach(s => this.solicitudesMap.set(s.id!, s.descripcionSolicitud.substring(0, 35)));
        domiciliarios.forEach(d => this.domiciliariosMap.set(d.id!, `${d.nombresDomiciliario} ${d.apellidosDomiciliario}`));
        tipos.forEach(t => {
          this.tiposMap.set(t.id!, t.nombreTipo);
          this.tiposCodigoMap.set(t.id!, t.codigoTipo || '');
        });
        disponibles.forEach(d => this.disponiblesMap.set(d.id!, `Disp. #${d.id} — Sol. #${d.solicitud}`));
        // DOMICILIARIO only sees rows linked to them
        const entityId = this.authSvc.currentUser()?.entityId;
        this.dsDisponible.data = this.isDomiciliario && entityId
          ? disponibles.filter(d => !d.domiciliario || d.domiciliario === entityId)
          : disponibles;
        this.dsAsignacion.data = this.isDomiciliario && entityId
          ? asignaciones.filter(a => {
              const disp = disponibles.find(d => d.id === a.solicitudDisponible);
              return disp?.domiciliario === entityId;
            })
          : asignaciones;
        this.loading.set(false);
      },
      error: () => {
        this.snack.open('Error al cargar datos', 'Cerrar', { duration: 3000, panelClass: 'snack-error' });
        this.loading.set(false);
      }
    });
  }

  getSolicitud(id: number)   { return this.solicitudesMap.get(id) || `Solicitud #${id}`; }
  getDomiciliario(id: number | null | undefined) { return id ? (this.domiciliariosMap.get(id) || `Dom. #${id}`) : '— Sin asignar'; }
  getTipo(id?: number | null) { return id ? (this.tiposMap.get(id) || `Tipo #${id}`) : 'Automático'; }
  getCodigo(item: SolicitudDisponible) { return item.tipoEstadoCodigo || (item.tipoEstado ? this.tiposCodigoMap.get(item.tipoEstado) : '') || ''; }
  canAceptar(item: SolicitudDisponible) { return !item.domiciliario && this.getCodigo(item) === 'PUBLICADA'; }
  getDisponible(id: number)  { return this.disponiblesMap.get(id) || `Disponible #${id}`; }

  openDisponible(item?: SolicitudDisponible) {
    this.dialog.open(DisponibleDialogComponent, { data: item ?? null, width: '600px' }).afterClosed().subscribe(r => { if (r) this.load(); });
  }

  openAsignacion(item?: Asignacion) {
    this.dialog.open(AsignacionDialogComponent, { data: item ?? null, width: '500px' }).afterClosed().subscribe(r => { if (r) this.load(); });
  }

  delDisponible(id: number) {
    if (!confirm('¿Eliminar solicitud disponible?')) return;
    this.service.delDisponible(id).subscribe({ next: () => { this.snack.open('Eliminado', 'OK', { duration: 2000, panelClass: 'snack-success' }); this.load(); } });
  }

  delAsignacion(id: number) {
    if (!confirm('¿Eliminar asignación?')) return;
    this.service.delAsignacion(id).subscribe({ next: () => { this.snack.open('Eliminado', 'OK', { duration: 2000, panelClass: 'snack-success' }); this.load(); } });
  }

  aceptar(item: SolicitudDisponible) {
    const entityId = this.authSvc.currentUser()?.entityId;
    const domiciliario = this.isDomiciliario && entityId
      ? entityId
      : Number(prompt('ID del domiciliario que acepta la solicitud'));
    if (!domiciliario) return;
    this.service.aceptarDisponible(item.id!, domiciliario).subscribe({
      next: () => { this.snack.open('Solicitud aceptada y asignación creada', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.load(); },
      error: (err) => this.snack.open(JSON.stringify(err?.error) || 'Error al aceptar', 'Cerrar', { duration: 5000, panelClass: 'snack-error' }),
    });
  }
}
