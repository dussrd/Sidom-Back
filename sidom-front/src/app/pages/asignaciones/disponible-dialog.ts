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
import { SlicePipe } from '@angular/common';
import { AsignacionService } from '../../core/services/asignacion.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { DomiciliarioService } from '../../core/services/domiciliario.service';
import { TipoMaestraService } from '../../core/services/tipo-maestra.service';
import { SolicitudDisponible } from '../../core/models/asignacion.model';

@Component({
  selector: 'app-disponible-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule, SlicePipe],
  templateUrl: './disponible-dialog.html',
})
export class DisponibleDialogComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private service         = inject(AsignacionService);
  private solicitudSvc    = inject(SolicitudService);
  private domiciliarioSvc = inject(DomiciliarioService);
  private tipoSvc         = inject(TipoMaestraService);
  private snack           = inject(MatSnackBar);
  dialogRef               = inject(MatDialogRef<DisponibleDialogComponent>);
  data: SolicitudDisponible | null = inject(MAT_DIALOG_DATA);

  isEdit = !!this.data?.id;
  saving = false;

  solicitudes   = signal<any[]>([]);
  domiciliarios = signal<any[]>([]);
  tipos         = signal<any[]>([]);

  form = this.fb.group({
    solicitud:                        [this.data?.solicitud ?? null,        [Validators.required]],
    domiciliario:                     [this.data?.domiciliario ?? null,     []],
    tipoEstado:                       [this.data?.tipoEstado ?? null,       []],
    fechaAceptacionSolicitudDisponible: [this.data?.fechaAceptacionSolicitudDisponible ?? null, []],
  });

  ngOnInit() {
    forkJoin({ s: this.solicitudSvc.getAll(), d: this.domiciliarioSvc.getAll(), t: this.tipoSvc.getAll() }).subscribe(
      ({ s, d, t }) => { this.solicitudes.set(s); this.domiciliarios.set(d); this.tipos.set(t); }
    );
  }

  tiposDisponibles() {
    const categoria = this.tipos().find(t => t.codigoTipo === 'CAT_ESTADO_DISP');
    return categoria ? this.tipos().filter(t => t.padreTipo === categoria.id) : this.tipos();
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value as SolicitudDisponible;
    const obs = this.isEdit ? this.service.putDisponible(this.data!.id!, val) : this.service.postDisponible(val);
    obs.subscribe({
      next: () => { this.snack.open(this.isEdit ? 'Actualizado' : 'Creado', 'OK', { duration: 3000, panelClass: 'snack-success' }); this.dialogRef.close(true); },
      error: (err) => { this.saving = false; this.snack.open(JSON.stringify(err?.error) || 'Error', 'Cerrar', { duration: 5000, panelClass: 'snack-error' }); }
    });
  }
}
