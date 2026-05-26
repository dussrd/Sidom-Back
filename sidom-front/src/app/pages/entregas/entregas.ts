import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { SlicePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { EntregaService } from '../../core/services/entrega.service';
import { TipoMaestraService } from '../../core/services/tipo-maestra.service';
import { AsignacionService } from '../../core/services/asignacion.service';
import { AuthService } from '../../core/services/auth.service';
import { HistorialEstadoEntrega, SeguimientoEntrega, Novedad } from '../../core/models/entrega.model';
import { HistorialDialogComponent } from './historial-dialog';
import { SeguimientoDialogComponent } from './seguimiento-dialog';
import { NovedadDialogComponent } from './novedad-dialog';

@Component({
  selector: 'app-entregas',
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatTabsModule, SlicePipe],
  templateUrl: './entregas.html',
})
export class EntregasComponent implements OnInit {
  private service    = inject(EntregaService);
  private tipoSvc    = inject(TipoMaestraService);
  private asignSvc   = inject(AsignacionService);
  private authSvc    = inject(AuthService);
  private dialog     = inject(MatDialog);
  private snack      = inject(MatSnackBar);

  isAdmin        = this.authSvc.isAdmin();
  isDomiciliario = this.authSvc.isDomiciliario();

  loading       = signal(true);
  dsHistorial   = new MatTableDataSource<HistorialEstadoEntrega>([]);
  dsSeguimiento = new MatTableDataSource<SeguimientoEntrega>([]);
  dsNovedad     = new MatTableDataSource<Novedad>([]);

  tiposMap      = new Map<number, string>();
  historialMap  = new Map<number, string>();
  asignacionesMap = new Map<number, string>();
  seguimientosMap = new Map<number, string>();

  colsHistorial   = ['id', 'tipoEstado', 'observacion', 'fecha', 'acciones'];
  colsSeguimiento = ['id', 'asignacion', 'estimada', 'real', 'cumplimiento', 'acciones'];
  colsNovedad     = ['id', 'seguimiento', 'descripcion', 'tipo', 'estado', 'acciones'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    forkJoin({
      historial:    this.service.getAllHistorial(),
      seguimientos: this.service.getAllSeguimientos(),
      novedades:    this.service.getAllNovedades(),
      tipos:        this.tipoSvc.getAll(),
      asignaciones: this.asignSvc.getAllAsignaciones(),
    }).subscribe({
      next: ({ historial, seguimientos, novedades, tipos, asignaciones }) => {
        tipos.forEach(t => this.tiposMap.set(t.id!, t.nombreTipo));
        asignaciones.forEach(a => this.asignacionesMap.set(a.id!, `Asig. #${a.id} (Disp. #${a.solicitudDisponible})`));
        historial.forEach(h => this.historialMap.set(h.id!, `${this.tiposMap.get(h.tipoEstado) || '#' + h.tipoEstado}`));
        seguimientos.forEach(s => this.seguimientosMap.set(s.id!, `Seg. #${s.id}`));
        // DOMICILIARIO only sees seguimientos linked to their asignaciones
        // For now we expose all data (backend should ideally filter); CRUD buttons are hidden
        this.dsHistorial.data   = historial;
        this.dsSeguimiento.data = seguimientos;
        this.dsNovedad.data     = novedades;
        this.loading.set(false);
      },
      error: () => { this.snack.open('Error al cargar', 'Cerrar', { duration: 3000, panelClass: 'snack-error' }); this.loading.set(false); }
    });
  }

  getTipo(id: number)        { return this.tiposMap.get(id) || `Tipo #${id}`; }
  getAsignacion(id: number)  { return this.asignacionesMap.get(id) || `Asig. #${id}`; }
  getSeguimiento(id: number) { return this.seguimientosMap.get(id) || `Seg. #${id}`; }

  cumplimientoBadge(c: string): string {
    if (c === 'A_TIEMPO') return 'success';
    if (c === 'CON_RETRASO') return 'danger';
    return 'warning';
  }

  cambiarEstado(item: SeguimientoEntrega) {
    const estado = Number(prompt('ID del nuevo estado de entrega'));
    if (!estado) return;
    const observacion = prompt('Observación del cambio') || '';
    this.service.cambiarEstado(item.id!, estado, observacion).subscribe({
      next: () => { this.snack.open('Estado actualizado', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.load(); },
      error: (err) => this.snack.open(JSON.stringify(err?.error) || 'Error al cambiar estado', 'Cerrar', { duration: 5000, panelClass: 'snack-error' }),
    });
  }

  resolver(item: Novedad) {
    const solucion = prompt('Solución aplicada a la novedad') || '';
    if (!solucion) return;
    this.service.resolverNovedad(item.id!, solucion).subscribe({
      next: () => { this.snack.open('Novedad resuelta', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.load(); },
      error: (err) => this.snack.open(JSON.stringify(err?.error) || 'Error al resolver', 'Cerrar', { duration: 5000, panelClass: 'snack-error' }),
    });
  }

  openHistorial(item?: HistorialEstadoEntrega) {
    this.dialog.open(HistorialDialogComponent, { data: item ?? null, width: '500px' }).afterClosed().subscribe(r => { if (r) this.load(); });
  }

  openSeguimiento(item?: SeguimientoEntrega) {
    this.dialog.open(SeguimientoDialogComponent, { data: item ?? null, width: '600px' }).afterClosed().subscribe(r => { if (r) this.load(); });
  }

  openNovedad(item?: Novedad) {
    this.dialog.open(NovedadDialogComponent, { data: item ?? null, width: '600px' }).afterClosed().subscribe(r => { if (r) this.load(); });
  }

  delHistorial(id: number) {
    if (!confirm('¿Eliminar?')) return;
    this.service.delHistorial(id).subscribe({ next: () => { this.snack.open('Eliminado', 'OK', { duration: 2000, panelClass: 'snack-success' }); this.load(); } });
  }

  delSeguimiento(id: number) {
    if (!confirm('¿Eliminar?')) return;
    this.service.delSeguimiento(id).subscribe({ next: () => { this.snack.open('Eliminado', 'OK', { duration: 2000, panelClass: 'snack-success' }); this.load(); } });
  }

  delNovedad(id: number) {
    if (!confirm('¿Eliminar?')) return;
    this.service.delNovedad(id).subscribe({ next: () => { this.snack.open('Eliminado', 'OK', { duration: 2000, panelClass: 'snack-success' }); this.load(); } });
  }
}
