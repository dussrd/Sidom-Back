import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ClienteService } from '../../core/services/cliente.service';
import { DomiciliarioService } from '../../core/services/domiciliario.service';
import { Cliente } from '../../core/models/cliente.model';
import { Domiciliario } from '../../core/models/domiciliario.model';

@Component({
  selector: 'app-mi-perfil',
  imports: [MatProgressSpinnerModule, MatIconModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfilComponent implements OnInit {
  private authSvc   = inject(AuthService);
  private clienteSvc = inject(ClienteService);
  private domSvc    = inject(DomiciliarioService);

  loading   = signal(true);
  error     = signal('');
  cliente   = signal<Cliente | null>(null);
  domiciliario = signal<Domiciliario | null>(null);

  user = this.authSvc.currentUser;

  ngOnInit() {
    const user = this.authSvc.currentUser();
    if (!user?.entityId) { this.loading.set(false); return; }

    if (user.role === 'CLIENTE') {
      this.clienteSvc.getById(user.entityId).subscribe({
        next: (c) => { this.cliente.set(c); this.loading.set(false); },
        error: () => { this.error.set('No se pudo cargar el perfil'); this.loading.set(false); }
      });
    } else if (user.role === 'DOMICILIARIO') {
      this.domSvc.getById(user.entityId).subscribe({
        next: (d) => { this.domiciliario.set(d); this.loading.set(false); },
        error: () => { this.error.set('No se pudo cargar el perfil'); this.loading.set(false); }
      });
    } else {
      this.loading.set(false);
    }
  }
}
