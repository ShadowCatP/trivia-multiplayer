import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const isAuthenticated = inject(AuthService).isAuthenticated();
  const router = inject(Router);

  if (isAuthenticated) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
