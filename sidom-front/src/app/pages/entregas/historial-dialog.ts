import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EntregaService } from '../../core/services/entrega.service';
import { TipoMaestraService } from '../../core/services/tipo-maestra.service';
import { HistorialEstadoEntrega } from '../../core/models/entrega.model';

@Component({
  selector: 'app-historial-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ isEdit ? 'Editar Historial' : 'Nuevo Historial de Estado' }}</h2>
        <button mat-icon-button (click)="dialogRef.close()" style="color:#fff"><span class="material-icons">close</span></button>
      </div>
      <form [formGroup]="form">
        <div class="dialog-body">
          <div class="form-row single">
            <mat-form-field appearance="outline">
              <mat-label>Tipo Estado</mat-label>
              <mat-select formControlName="tipoEstado">
                @for (t of tipos(); track t.id) {
                  <mat-option [value]="t.id">{{ t.nombreTipo }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row single">
            <mat-form-field appearance="outline">
              <mat-label>Observación (opcional)</mat-label>
              <textarea matInput formControlName="observacionHistorial" rows="3"></textarea>
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
export class HistorialDialogComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private service = inject(EntregaService);
  private tipoSvc = inject(TipoMaestraService);
  private snack   = inject(MatSnackBar);
  dialogRef       = inject(MatDialogRef<HistorialDialogComponent>);
  data: HistorialEstadoEntrega | null = inject(MAT_DIALOG_DATA);

  isEdit = !!this.data?.id;
  saving = false;
  tipos  = signal<any[]>([]);

  form = this.fb.group({
    tipoEstado:          [this.data?.tipoEstado ?? null,          [Validators.required]],
    observacionHistorial:[this.data?.observacionHistorial ?? '',   []],
  });

  ngOnInit() { this.tipoSvc.getAll().subscribe(t => this.tipos.set(t)); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value as HistorialEstadoEntrega;
    const obs = this.isEdit ? this.service.putHistorial(this.data!.id!, val) : this.service.postHistorial(val);
    obs.subscribe({
      next: () => { this.snack.open(this.isEdit ? 'Actualizado' : 'Creado', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.dialogRef.close(true); },
      error: (err) => { this.saving = false; this.snack.open(JSON.stringify(err?.error) || 'Error', 'Cerrar', { duration: 5000, panelClass: 'snack-error' }); }
    });
  }
}
