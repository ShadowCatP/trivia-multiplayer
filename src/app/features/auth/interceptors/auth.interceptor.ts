import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token;
  const isAuthenticated = inject(AuthService).isAuthenticated();

  if (!token || !isAuthenticated) {
    return next(req);
  }
  const newReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(newReq);
};
