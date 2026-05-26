import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TrackingService } from '../../core/services/tracking.service';
import { AsignacionService } from '../../core/services/asignacion.service';
import { DomiciliarioService } from '../../core/services/domiciliario.service';
import { UbicacionDomiciliario } from '../../core/models/tracking.model';
import { Asignacion } from '../../core/models/asignacion.model';
import { forkJoin } from 'rxjs';

export interface AsignacionOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-ubicacion-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ubicacion-dialog.html',
})
export class UbicacionDialogComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private service         = inject(TrackingService);
  private asignSvc        = inject(AsignacionService);
  private domiciliarioSvc = inject(DomiciliarioService);
  private snack           = inject(MatSnackBar);
  dialogRef               = inject(MatDialogRef<UbicacionDialogComponent>);
  data: UbicacionDomiciliario | null = inject(MAT_DIALOG_DATA);

  isEdit          = !!this.data?.id;
  saving          = false;
  loadingOptions  = true;
  asignaciones    = signal<AsignacionOption[]>([]);

  form = this.fb.group({
    latitudUbicacion:  [this.data?.latitudUbicacion  ?? null as number | null, [Validators.required, Validators.min(-90),  Validators.max(90)]],
    longitudUbicacion: [this.data?.longitudUbicacion ?? null as number | null, [Validators.required, Validators.min(-180), Validators.max(180)]],
    asignacion:        [this.data?.asignacion ?? null as number | null,        [Validators.required]],
  });

  ngOnInit() {
    forkJoin({
      asignaciones:  this.asignSvc.getAllAsignaciones(),
      domiciliarios: this.domiciliarioSvc.getAll(),
    }).subscribe({
      next: ({ asignaciones, domiciliarios }) => {
        const dMap = new Map<number, string>();
        domiciliarios.forEach(d => dMap.set(d.id!, `${d.nombresDomiciliario} ${d.apellidosDomiciliario}`));

        const opts: AsignacionOption[] = asignaciones.map(a => ({
          id: a.id!,
          label: `Asig. #${a.id} — Disp. #${a.solicitudDisponible}`,
        }));
        this.asignaciones.set(opts);
        this.loadingOptions = false;
      },
      error: (err) => {
        this.loadingOptions = false;
        this.snack.open('No se pudieron cargar las asignaciones', 'Cerrar', { duration: 4000, panelClass: 'snack-error' });
      },
    });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value as UbicacionDomiciliario;
    const obs = this.isEdit
      ? this.service.put(this.data!.id!, val)
      : this.service.post(val);
    obs.subscribe({
      next: () => {
        this.snack.open(this.isEdit ? 'Actualizado' : 'Registrado', 'OK', { duration: 3000, panelClass: 'snack-success' });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(JSON.stringify(err?.error) || 'Error al guardar', 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
      },
    });
  }
}
