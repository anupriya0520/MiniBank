import { inject } from '@angular/core';
import { CanActivateFn,ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route:ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  
if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

const allowedRoles = route.data?.['roles'] as string[] | undefined;
  const userRole = authService.getUser()?.role; 

  if (allowedRoles?.length && !allowedRoles.includes(userRole)) {
    router.navigate([userRole === 'Admin' ? '/admin/dashboard' : '/dashboard']);
    return false;
  }

  return true;

};