import { Routes } from '@angular/router';
import { AuthenticationGuard } from './core/guards/authentication-guard';
import { LoginRedirectGuard } from './core/guards/login-redirect.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [LoginRedirectGuard]
  },
  {
    path: 'waiting-room',
    loadComponent: () => import('./pages/home/waiting-room.component').then(m => m.WaitingRoomComponent),
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/home/dashboard-section.component').then(m => m.DashboardSectionComponent)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: 'game',
    loadComponent: () => import('./pages/game/game-section.component').then(m => m.GameSectionComponent),
    canActivate: [AuthenticationGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'waiting-room'
  },
  {
    path: '**',
    redirectTo: 'waiting-room'
  }
];
