import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthenticationGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const authToken = localStorage.getItem('token');
    // Si no hay token, redirige a login
    if (!authToken) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}