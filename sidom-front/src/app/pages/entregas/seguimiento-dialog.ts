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
import { AsignacionService } from '../../core/services/asignacion.service';
import { SeguimientoEntrega } from '../../core/models/entrega.model';

@Component({
  selector: 'app-seguimiento-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ isEdit ? 'Editar Seguimiento' : 'Nuevo Seguimiento' }}</h2>
        <button mat-icon-button (click)="dialogRef.close()" style="color:#fff"><span class="material-icons">close</span></button>
      </div>
      <form [formGroup]="form">
        <div class="dialog-body">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Asignación</mat-label>
              <mat-select formControlName="asignacion">
                @for (a of asignaciones(); track a.id) {
                  <mat-option [value]="a.id">#{{ a.id }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Historial Estado</mat-label>
              <mat-select formControlName="historialEstadoEntrega">
                @for (h of historial(); track h.id) {
                  <mat-option [value]="h.id">#{{ h.id }} — Estado #{{ h.tipoEstado }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Fecha Estimada</mat-label>
              <input matInput type="datetime-local" formControlName="fechaEstimadaSeguimiento" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Fecha Real (opcional)</mat-label>
              <input matInput type="datetime-local" formControlName="fechaRealSeguimiento" />
            </mat-form-field>
          </div>
          <div class="form-row single">
            <mat-form-field appearance="outline">
              <mat-label>Cumplimiento</mat-label>
              <mat-select formControlName="cumplimientoSeguimiento">
                <mat-option value="PENDIENTE">Pendiente</mat-option>
                <mat-option value="CUMPLIDO">Cumplido</mat-option>
                <mat-option value="INCUMPLIDO">Incumplido</mat-option>
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
export class SeguimientoDialogComponent implements OnInit {
  private fb         = inject(FormBuilder);
  private service    = inject(EntregaService);
  private asignSvc   = inject(AsignacionService);
  private snack      = inject(MatSnackBar);
  dialogRef          = inject(MatDialogRef<SeguimientoDialogComponent>);
  data: SeguimientoEntrega | null = inject(MAT_DIALOG_DATA);

  isEdit     = !!this.data?.id;
  saving     = false;
  asignaciones = signal<any[]>([]);
  historial    = signal<any[]>([]);

  form = this.fb.group({
    asignacion:               [this.data?.asignacion ?? null,               [Validators.required]],
    historialEstadoEntrega:   [this.data?.historialEstadoEntrega ?? null,   [Validators.required]],
    fechaEstimadaSeguimiento: [this.data?.fechaEstimadaSeguimiento ?? '',   [Validators.required]],
    fechaRealSeguimiento:     [this.data?.fechaRealSeguimiento ?? null,     []],
    cumplimientoSeguimiento:  [this.data?.cumplimientoSeguimiento ?? 'PENDIENTE', [Validators.required]],
  });

  ngOnInit() {
    forkJoin({ a: this.asignSvc.getAllAsignaciones(), h: this.service.getAllHistorial() }).subscribe(
      ({ a, h }) => { this.asignaciones.set(a); this.historial.set(h); }
    );
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value as SeguimientoEntrega;
    const obs = this.isEdit ? this.service.putSeguimiento(this.data!.id!, val) : this.service.postSeguimiento(val);
    obs.subscribe({
      next: () => { this.snack.open(this.isEdit ? 'Actualizado' : 'Creado', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.dialogRef.close(true); },
      error: (err) => { this.saving = false; this.snack.open(JSON.stringify(err?.error) || 'Error', 'Cerrar', { duration: 5000, panelClass: 'snack-error' }); }
    });
  }
}
