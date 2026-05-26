import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClienteService } from '../../core/services/cliente.service';
import { Cliente } from '../../core/models/cliente.model';

@Component({
  selector: 'app-cliente-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './cliente-dialog.html',
})
export class ClienteDialogComponent {
  private fb      = inject(FormBuilder);
  private service = inject(ClienteService);
  private snack   = inject(MatSnackBar);
  dialogRef       = inject(MatDialogRef<ClienteDialogComponent>);
  data: Cliente | null = inject(MAT_DIALOG_DATA);

  isEdit = !!this.data?.id;

  form = this.fb.group({
    identificacionCliente: [this.data?.identificacionCliente ?? '', [Validators.required, Validators.pattern(/^\d+$/)]],
    nombresCliente:        [this.data?.nombresCliente ?? '',        [Validators.required, Validators.minLength(2)]],
    apellidosCliente:      [this.data?.apellidosCliente ?? '',      [Validators.required, Validators.minLength(2)]],
    telefonoCliente:       [this.data?.telefonoCliente ?? '',       [Validators.required, Validators.pattern(/^\d+$/)]],
    correoCliente:         [this.data?.correoCliente ?? '',         [Validators.required, Validators.email]],
    direccionCliente:      [this.data?.direccionCliente ?? '',      [Validators.required, Validators.minLength(5)]],
  });

  saving = false;

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value as Cliente;
    const obs = this.isEdit
      ? this.service.put(this.data!.id!, val)
      : this.service.post(val);
    obs.subscribe({
      next: () => {
        this.snack.open(this.isEdit ? 'Cliente actualizado' : 'Cliente creado', 'OK', { duration: 3000, panelClass: 'snack-success' });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error ? JSON.stringify(err.error) : 'Error al guardar';
        this.snack.open(msg, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
      }
    });
  }
}
