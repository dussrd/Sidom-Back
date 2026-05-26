import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClienteService } from '../../core/services/cliente.service';
import { Cliente } from '../../core/models/cliente.model';
import { ClienteDialogComponent } from './cliente-dialog';

@Component({
  selector: 'app-clientes',
  imports: [
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './clientes.html',
})
export class ClientesComponent implements OnInit {
  private service  = inject(ClienteService);
  private dialog   = inject(MatDialog);
  private snack    = inject(MatSnackBar);

  loading = signal(true);
  dataSource = new MatTableDataSource<Cliente>([]);
  displayedColumns = ['identificacion', 'nombre', 'correo', 'telefono', 'direccion', 'acciones'];

  @ViewChild(MatSort)    set sort(s: MatSort)        { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set pag(p: MatPaginator)  { this.dataSource.paginator = p; }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.dataSource.data = data; this.loading.set(false); },
      error: () => { this.snack.open('Error al cargar clientes', 'Cerrar', { duration: 3000, panelClass: 'snack-error' }); this.loading.set(false); }
    });
  }

  filter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  openDialog(cliente?: Cliente) {
    const ref = this.dialog.open(ClienteDialogComponent, { data: cliente ?? null, width: '600px' });
    ref.afterClosed().subscribe(result => { if (result) this.load(); });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar este cliente?')) return;
    this.service.del(id).subscribe({
      next: () => { this.snack.open('Cliente eliminado', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.load(); },
      error: () => this.snack.open('Error al eliminar', 'Cerrar', { duration: 3000, panelClass: 'snack-error' })
    });
  }
}
