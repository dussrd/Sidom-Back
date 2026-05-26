import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { EntregaService } from '../../core/services/entrega.service';
import { TipoMaestraService } from '../../core/services/tipo-maestra.service';
import { Novedad } from '../../core/models/entrega.model';

@Component({
  selector: 'app-novedad-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ isEdit ? 'Editar Novedad' : 'Nueva Novedad' }}</h2>
        <button mat-icon-button (click)="dialogRef.close()" style="color:#fff"><span class="material-icons">close</span></button>
      </div>
      <form [formGroup]="form">
        <div class="dialog-body">
          <div class="form-row single">
            <mat-form-field appearance="outline">
              <mat-label>Seguimiento</mat-label>
              <mat-select formControlName="seguimientoEntrega">
                @for (s of seguimientos(); track s.id) {
                  <mat-option [value]="s.id">#{{ s.id }} — Asig #{{ s.asignacion }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row single">
            <mat-form-field appearance="outline">
              <mat-label>Descripción (mín. 10 caracteres)</mat-label>
              <textarea matInput formControlName="descripcionNovedad" rows="3"></textarea>
              @if (form.get('descripcionNovedad')?.hasError('minlength')) {
                <mat-error>Mínimo 10 caracteres</mat-error>
              }
            </mat-form-field>
          </div>
          <div class="form-row single">
            <mat-form-field appearance="outline">
              <mat-label>Solución (opcional)</mat-label>
              <textarea matInput formControlName="solucionNovedad" rows="2"></textarea>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Tipo Novedad</mat-label>
              <mat-select formControlName="tipoNovedad">
                @for (t of tiposPorCategoria('CAT_NOVEDAD'); track t.id) {
                  <mat-option [value]="t.id">{{ t.nombreTipo }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Estado (automático)</mat-label>
              <mat-select formControlName="tipoEstado">
                <mat-option [value]="null">Usar tipo de novedad</mat-option>
                @for (t of tiposPorCategoria('CAT_NOVEDAD'); track t.id) {
                  <mat-option [value]="t.id">{{ t.nombreTipo }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
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
export class NovedadDialogComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private service = inject(EntregaService);
  private tipoSvc = inject(TipoMaestraService);
  private snack   = inject(MatSnackBar);
  dialogRef       = inject(MatDialogRef<NovedadDialogComponent>);
  data: Novedad | null = inject(MAT_DIALOG_DATA);

  isEdit      = !!this.data?.id;
  saving      = false;
  seguimientos = signal<any[]>([]);
  tipos        = signal<any[]>([]);

  form = this.fb.group({
    seguimientoEntrega: [this.data?.seguimientoEntrega ?? null, [Validators.required]],
    descripcionNovedad: [this.data?.descripcionNovedad ?? '',   [Validators.required, Validators.minLength(10)]],
    solucionNovedad:    [this.data?.solucionNovedad ?? '',      []],
    tipoNovedad:        [this.data?.tipoNovedad ?? null,        [Validators.required]],
    tipoEstado:         [this.data?.tipoEstado ?? null,         []],
  });

  ngOnInit() {
    forkJoin({ s: this.service.getAllSeguimientos(), t: this.tipoSvc.getAll() }).subscribe(
      ({ s, t }) => { this.seguimientos.set(s); this.tipos.set(t); }
    );
  }

  tiposPorCategoria(codigo: string) {
    const categoria = this.tipos().find(t => t.codigoTipo === codigo);
    return categoria ? this.tipos().filter(t => t.padreTipo === categoria.id) : this.tipos();
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value as Novedad;
    const obs = this.isEdit ? this.service.putNovedad(this.data!.id!, val) : this.service.postNovedad(val);
    obs.subscribe({
      next: () => { this.snack.open(this.isEdit ? 'Actualizado' : 'Creado', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.dialogRef.close(true); },
      error: (err) => { this.saving = false; this.snack.open(JSON.stringify(err?.error) || 'Error', 'Cerrar', { duration: 5000, panelClass: 'snack-error' }); }
    });
  }
}
