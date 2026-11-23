
import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Veterinarias } from './pages/veterinarias/veterinarias';
import { Usuarios } from './pages/usuarios/usuarios';
import { Tutores } from './pages/tutores/tutores';

import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'veterinarias',
    component: Veterinarias,
    canActivate: [authGuard]
  },
  {
    path: 'usuarios',
    component: Usuarios,
    canActivate: [authGuard]
  },
  {
    path: 'tutores',
    component: Tutores,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
