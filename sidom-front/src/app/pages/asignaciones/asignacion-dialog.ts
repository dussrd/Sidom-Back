import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AsignacionService } from '../../core/services/asignacion.service';
import { Asignacion } from '../../core/models/asignacion.model';

@Component({
  selector: 'app-asignacion-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './asignacion-dialog.html',
})
export class AsignacionDialogComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private service = inject(AsignacionService);
  private snack   = inject(MatSnackBar);
  dialogRef       = inject(MatDialogRef<AsignacionDialogComponent>);
  data: Asignacion | null = inject(MAT_DIALOG_DATA);

  isEdit     = !!this.data?.id;
  saving     = false;
  disponibles = signal<any[]>([]);

  form = this.fb.group({
    solicitudDisponible: [this.data?.solicitudDisponible ?? null, [Validators.required]],
  });

  ngOnInit() {
    this.service.getAllDisponibles().subscribe(d => this.disponibles.set(d));
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value as Asignacion;
    const obs = this.isEdit ? this.service.putAsignacion(this.data!.id!, val) : this.service.postAsignacion(val);
    obs.subscribe({
      next: () => { this.snack.open(this.isEdit ? 'Actualizado' : 'Creado', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.dialogRef.close(true); },
      error: (err) => { this.saving = false; this.snack.open(JSON.stringify(err?.error) || 'Error', 'Cerrar', { duration: 5000, panelClass: 'snack-error' }); }
    });
  }
}
