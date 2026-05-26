import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TipoMaestraService } from '../../core/services/tipo-maestra.service';
import { TipoMaestra } from '../../core/models/tipo-maestra.model';

@Component({
  selector: 'app-tipo-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ isEdit ? 'Editar Tipo Maestra' : 'Nuevo Tipo Maestra' }}</h2>
        <button mat-icon-button (click)="dialogRef.close()" style="color:#fff"><span class="material-icons">close</span></button>
      </div>
      <form [formGroup]="form">
        <div class="dialog-body">
          <div class="form-row single">
            <mat-form-field appearance="outline">
              <mat-label>Nombre del Tipo</mat-label>
              <input matInput formControlName="nombreTipo" />
              @if (form.get('nombreTipo')?.hasError('required')) {
                <mat-error>Requerido</mat-error>
              }
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Código (opcional)</mat-label>
              <input matInput formControlName="codigoTipo" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Tipo Padre (opcional)</mat-label>
              <mat-select formControlName="padreTipo">
                <mat-option [value]="null">Sin padre</mat-option>
                @for (t of allTipos(); track t.id) {
                  <mat-option [value]="t.id">{{ t.nombreTipo }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div style="padding:8px 0">
            <mat-slide-toggle formControlName="esTabla" color="primary">Es Tabla</mat-slide-toggle>
          </div>
        </div>
        <div class="dialog-footer">
          <button mat-stroked-button (click)="dialogRef.close()">Cancelar</button>
          <button mat-flat-button class="btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }}</button>
        </div>
      </form>
    </div>
  `,
})
export class TipoDialogComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private service = inject(TipoMaestraService);
  private snack   = inject(MatSnackBar);
  dialogRef       = inject(MatDialogRef<TipoDialogComponent>);
  data: TipoMaestra | null = inject(MAT_DIALOG_DATA);

  isEdit   = !!this.data?.id;
  saving   = false;
  allTipos = signal<TipoMaestra[]>([]);

  form = this.fb.group({
    nombreTipo: [this.data?.nombreTipo ?? '', [Validators.required]],
    codigoTipo: [this.data?.codigoTipo ?? '', []],
    padreTipo:  [this.data?.padreTipo ?? null, []],
    esTabla:    [this.data?.esTabla ?? false, []],
  });

  ngOnInit() { this.service.getAll().subscribe(t => this.allTipos.set(t)); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value as TipoMaestra;
    const obs = this.isEdit ? this.service.put(this.data!.id!, val) : this.service.post(val);
    obs.subscribe({
      next: () => { this.snack.open(this.isEdit ? 'Actualizado' : 'Creado', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.dialogRef.close(true); },
      error: (err) => { this.saving = false; this.snack.open(JSON.stringify(err?.error) || 'Error', 'Cerrar', { duration: 5000, panelClass: 'snack-error' }); }
    });
  }
}

@Component({
  selector: 'app-tipos-maestra',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './tipos-maestra.html',
})
export class TiposMaestraComponent implements OnInit {
  private service = inject(TipoMaestraService);
  private dialog  = inject(MatDialog);
  private snack   = inject(MatSnackBar);

  loading    = signal(true);
  dataSource = new MatTableDataSource<TipoMaestra>([]);
  displayedColumns = ['id', 'nombreTipo', 'codigoTipo', 'padreTipo', 'esTabla', 'acciones'];

  @ViewChild(MatSort)    set sort(s: MatSort)       { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set pag(p: MatPaginator) { this.dataSource.paginator = p; }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.getAll().subscribe({ next: d => { this.dataSource.data = d; this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  filter(e: Event) { this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase(); }

  openDialog(item?: TipoMaestra) {
    this.dialog.open(TipoDialogComponent, { data: item ?? null, width: '560px' }).afterClosed().subscribe(r => { if (r) this.load(); });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar este tipo?')) return;
    this.service.del(id).subscribe({
      next: () => { this.snack.open('Eliminado', 'OK', { duration: 2000, panelClass: 'snack-success' }); this.load(); },
      error: () => this.snack.open('Error al eliminar', 'Cerrar', { duration: 3000, panelClass: 'snack-error' })
    });
  }
}
