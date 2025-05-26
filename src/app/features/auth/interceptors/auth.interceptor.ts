import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token;

  const newReq = req.clone({
    headers: req.headers.append(
      'Authorization',
      token ? `Bearer ${token}` : '',
    ),
  });

  return next(newReq);
};
