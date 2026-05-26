import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'clientes',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () => import('./pages/clientes/clientes').then(m => m.ClientesComponent)
      },
      {
        path: 'domiciliarios',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () => import('./pages/domiciliarios/domiciliarios').then(m => m.DomiciliariosComponent)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () => import('./pages/usuarios/usuarios').then(m => m.UsuariosComponent)
      },
      {
        path: 'solicitudes',
        canActivate: [roleGuard('ADMIN', 'CLIENTE')],
        loadComponent: () => import('./pages/solicitudes/solicitudes').then(m => m.SolicitudesComponent)
      },
      {
        path: 'asignaciones',
        canActivate: [roleGuard('ADMIN', 'DOMICILIARIO')],
        loadComponent: () => import('./pages/asignaciones/asignaciones').then(m => m.AsignacionesComponent)
      },
      {
        path: 'entregas',
        canActivate: [roleGuard('ADMIN', 'DOMICILIARIO')],
        loadComponent: () => import('./pages/entregas/entregas').then(m => m.EntregasComponent)
      },
      {
        path: 'tracking',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () => import('./pages/tracking/tracking').then(m => m.TrackingComponent)
      },
      {
        path: 'tipos-maestra',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () => import('./pages/tipos-maestra/tipos-maestra').then(m => m.TiposMaestraComponent)
      },
      {
        path: 'mis-domicilios',
        canActivate: [roleGuard('CLIENTE', 'ADMIN')],
        loadComponent: () => import('./pages/mis-domicilios/mis-domicilios').then(m => m.MisDomiciliosComponent)
      },
      {
        path: 'mi-perfil',
        canActivate: [roleGuard('CLIENTE', 'DOMICILIARIO')],
        loadComponent: () => import('./pages/mi-perfil/mi-perfil').then(m => m.MiPerfilComponent)
      },
    ]
  },
  { path: '**', redirectTo: '' }
];
