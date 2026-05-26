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
import { UsuarioService } from '../../core/services/usuario.service';
import { TipoMaestraService } from '../../core/services/tipo-maestra.service';
import { ClienteService } from '../../core/services/cliente.service';
import { DomiciliarioService } from '../../core/services/domiciliario.service';
import { Usuario } from '../../core/models/usuario.model';
import { UsuarioDialogComponent } from './usuario-dialog';

@Component({
  selector: 'app-usuarios',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './usuarios.html',
})
export class UsuariosComponent implements OnInit {
  private service = inject(UsuarioService);
  private tipoSvc = inject(TipoMaestraService);
  private clienteSvc = inject(ClienteService);
  private domiciliarioSvc = inject(DomiciliarioService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  loading = signal(true);
  dataSource = new MatTableDataSource<Usuario>([]);
  displayedColumns = ['username', 'rol', 'vinculo', 'activo', 'acciones'];

  tiposMap = new Map<number, string>();
  clientesMap = new Map<number, string>();
  domiciliariosMap = new Map<number, string>();

  @ViewChild(MatSort) set sort(s: MatSort) { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set pag(p: MatPaginator) { this.dataSource.paginator = p; }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    forkJoin({
      usuarios: this.service.getAll(),
      tipos: this.tipoSvc.getAll(),
      clientes: this.clienteSvc.getAll(),
      domiciliarios: this.domiciliarioSvc.getAll(),
    }).subscribe({
      next: ({ usuarios, tipos, clientes, domiciliarios }) => {
        tipos.forEach(t => this.tiposMap.set(t.id!, t.nombreTipo));
        clientes.forEach(c => this.clientesMap.set(c.id!, `${c.nombresCliente} ${c.apellidosCliente}`));
        domiciliarios.forEach(d => this.domiciliariosMap.set(d.id!, `${d.nombresDomiciliario} ${d.apellidosDomiciliario}`));
        this.dataSource.data = usuarios;
        this.loading.set(false);
      },
      error: () => {
        this.snack.open('Error al cargar usuarios', 'Cerrar', { duration: 3000, panelClass: 'snack-error' });
        this.loading.set(false);
      },
    });
  }

  getRol(id: number) { return this.tiposMap.get(id) || `Rol #${id}`; }
  getVinculo(usuario: Usuario) {
    if (usuario.cliente) return this.clientesMap.get(usuario.cliente) || `Cliente #${usuario.cliente}`;
    if (usuario.domiciliario) return this.domiciliariosMap.get(usuario.domiciliario) || `Domiciliario #${usuario.domiciliario}`;
    return 'Administrador';
  }

  filter(e: Event) { this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase(); }

  openDialog(item?: Usuario) {
    this.dialog.open(UsuarioDialogComponent, { data: item ?? null, width: '620px' })
      .afterClosed().subscribe(r => { if (r) this.load(); });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.service.del(id).subscribe({
      next: () => { this.snack.open('Usuario eliminado', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.load(); },
      error: () => this.snack.open('Error al eliminar', 'Cerrar', { duration: 3000, panelClass: 'snack-error' }),
    });
  }
}
