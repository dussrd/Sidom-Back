import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ClienteService } from '../../core/services/cliente.service';
import { DomiciliarioService } from '../../core/services/domiciliario.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { AsignacionService } from '../../core/services/asignacion.service';
import { EntregaService } from '../../core/services/entrega.service';
import { AuthService } from '../../core/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [MatProgressSpinnerModule, MatIconModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private clienteService      = inject(ClienteService);
  private domiciliarioService = inject(DomiciliarioService);
  private usuarioService      = inject(UsuarioService);
  private solicitudService    = inject(SolicitudService);
  private asignacionService   = inject(AsignacionService);
  private entregaService      = inject(EntregaService);
  private authSvc             = inject(AuthService);

  loading   = signal(true);
  stats     = signal<StatCard[]>([]);
  greeting  = signal('');

  ngOnInit() {
    const user = this.authSvc.currentUser();
    this.greeting.set(user ? `Bienvenido, ${user.name}` : 'Bienvenido');

    if (this.authSvc.isAdmin()) {
      this.loadAdmin();
    } else if (this.authSvc.isCliente()) {
      this.loadCliente(user?.entityId ?? null);
    } else if (this.authSvc.isDomiciliario()) {
      this.loadDomiciliario(user?.entityId ?? null);
    } else {
      this.loading.set(false);
    }
  }

  private loadAdmin() {
    forkJoin({
      clientes:     this.clienteService.getAll(),
      domiciliarios: this.domiciliarioService.getAll(),
      usuarios:     this.usuarioService.getAll(),
      solicitudes:  this.solicitudService.getAll(),
      asignaciones: this.asignacionService.getAllAsignaciones(),
      novedades:    this.entregaService.getAllNovedades(),
    }).subscribe({
      next: (data) => {
        this.stats.set([
          { label: 'Clientes',      value: data.clientes.length,      icon: 'people',          color: 'blue'   },
          { label: 'Domiciliarios', value: data.domiciliarios.length, icon: 'delivery_dining', color: 'green'  },
          { label: 'Usuarios',      value: data.usuarios.length,      icon: 'manage_accounts', color: 'cyan'   },
          { label: 'Solicitudes',   value: data.solicitudes.length,   icon: 'assignment',      color: 'orange' },
          { label: 'Asignaciones',  value: data.asignaciones.length,  icon: 'task_alt',        color: 'purple' },
          { label: 'Novedades',     value: data.novedades.length,     icon: 'report_problem',  color: 'red'    },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadCliente(entityId: number | null) {
    forkJoin({
      solicitudes: this.solicitudService.getAll(),
      asignaciones: this.asignacionService.getAllAsignaciones(),
    }).subscribe({
      next: ({ solicitudes, asignaciones }) => {
        const misSolicitudes = entityId
          ? solicitudes.filter(s => s.cliente === entityId)
          : solicitudes;
        this.stats.set([
          { label: 'Mis Solicitudes',   value: misSolicitudes.length, icon: 'assignment',     color: 'orange' },
          { label: 'En Proceso',        value: misSolicitudes.filter(s => s.tipoEstadoCodigo === 'EN_PROCESO').length, icon: 'pending', color: 'blue' },
          { label: 'Entregas Activas',  value: asignaciones.length,   icon: 'local_shipping', color: 'green'  },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadDomiciliario(entityId: number | null) {
    forkJoin({
      disponibles:  this.asignacionService.getAllDisponibles(),
      asignaciones: this.asignacionService.getAllAsignaciones(),
      novedades:    this.entregaService.getAllNovedades(),
    }).subscribe({
      next: ({ disponibles, asignaciones, novedades }) => {
        const misDiponibles = entityId
          ? disponibles.filter(d => d.domiciliario === entityId)
          : disponibles;
        this.stats.set([
          { label: 'Mis Asignaciones',  value: misDiponibles.length, icon: 'task_alt',       color: 'purple' },
          { label: 'Asignadas Totales', value: asignaciones.length,  icon: 'local_shipping', color: 'blue'   },
          { label: 'Novedades',         value: novedades.length,     icon: 'report_problem', color: 'red'    },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
