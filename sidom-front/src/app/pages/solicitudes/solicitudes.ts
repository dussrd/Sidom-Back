import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { SolicitudService } from '../../core/services/solicitud.service';
import { AsignacionService } from '../../core/services/asignacion.service';
import { ClienteService } from '../../core/services/cliente.service';
import { TipoMaestraService } from '../../core/services/tipo-maestra.service';
import { AuthService } from '../../core/services/auth.service';
import { Solicitud } from '../../core/models/solicitud.model';
import { SolicitudDialogComponent } from './solicitud-dialog';

@Component({
  selector: 'app-solicitudes',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './solicitudes.html',
})
export class SolicitudesComponent implements OnInit {
  private service    = inject(SolicitudService);
  private asignacionSvc = inject(AsignacionService);
  private clienteSvc = inject(ClienteService);
  private tipoSvc    = inject(TipoMaestraService);
  private authSvc    = inject(AuthService);
  private dialog     = inject(MatDialog);
  private snack      = inject(MatSnackBar);

  isAdmin   = this.authSvc.isAdmin();
  isCliente = this.authSvc.isCliente();

  loading    = signal(true);
  dataSource = new MatTableDataSource<Solicitud>([]);
  displayedColumns = this.isCliente
    ? ['id', 'fecha', 'descripcion', 'estado', 'entrega', 'proceso', 'acciones']
    : ['id', 'fecha', 'descripcion', 'cliente', 'estado', 'entrega', 'proceso', 'acciones'];

  clientesMap = new Map<number, string>();
  tiposMap    = new Map<number, string>();
  tiposCodigoMap = new Map<number, string>();

  @ViewChild(MatSort)    set sort(s: MatSort)       { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set pag(p: MatPaginator) { this.dataSource.paginator = p; }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    forkJoin({
      solicitudes: this.service.getAll(),
      clientes:    this.clienteSvc.getAll(),
      tipos:       this.tipoSvc.getAll(),
    }).subscribe({
      next: ({ solicitudes, clientes, tipos }) => {
        clientes.forEach(c => this.clientesMap.set(c.id!, `${c.nombresCliente} ${c.apellidosCliente}`));
        tipos.forEach(t => {
          this.tiposMap.set(t.id!, t.nombreTipo);
          this.tiposCodigoMap.set(t.id!, t.codigoTipo || '');
        });
        // CLIENTE only sees their own solicitudes
        const entityId = this.authSvc.currentUser()?.entityId;
        this.dataSource.data = this.isCliente && entityId
          ? solicitudes.filter(s => s.cliente === entityId)
          : solicitudes;
        this.loading.set(false);
      },
      error: () => { this.snack.open('Error al cargar', 'Cerrar', { duration: 3000, panelClass: 'snack-error' }); this.loading.set(false); }
    });
  }

  getCliente(id: number) { return this.clientesMap.get(id) || `Cliente #${id}`; }
  getTipo(id?: number | null) { return id ? (this.tiposMap.get(id) || `Tipo #${id}`) : 'Automático'; }
  getCodigo(item: Solicitud) { return item.tipoEstadoCodigo || (item.tipoEstado ? this.tiposCodigoMap.get(item.tipoEstado) : '') || ''; }
  canPublicar(item: Solicitud) { return this.getCodigo(item) === 'VALIDADA'; }
  canReintentar(item: Solicitud) { return this.getCodigo(item) === 'RECHAZADA'; }

  filter(e: Event) { this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase(); }

  openDialog(item?: Solicitud) {
    this.dialog.open(SolicitudDialogComponent, { data: item ?? null, width: '650px' })
      .afterClosed().subscribe(r => { if (r) this.load(); });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    this.service.del(id).subscribe({
      next: () => { this.snack.open('Solicitud eliminada', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.load(); },
      error: () => this.snack.open('Error al eliminar', 'Cerrar', { duration: 3000, panelClass: 'snack-error' })
    });
  }

  publicar(item: Solicitud) {
    this.asignacionSvc.publicarSolicitud(item.id!).subscribe({
      next: () => { this.snack.open('Solicitud publicada al pool', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.load(); },
      error: (err) => this.snack.open(JSON.stringify(err?.error) || 'Error al publicar', 'Cerrar', { duration: 5000, panelClass: 'snack-error' })
    });
  }

  reintentar(item: Solicitud) {
    this.service.reintentar(item.id!).subscribe({
      next: () => { this.snack.open('Solicitud revalidada', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.load(); },
      error: (err) => this.snack.open(JSON.stringify(err?.error) || 'Error al reintentar', 'Cerrar', { duration: 5000, panelClass: 'snack-error' })
    });
  }
}
