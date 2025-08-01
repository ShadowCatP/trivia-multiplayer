import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.accessToken();

  const newReq =
    token && !req.url.includes('/refresh')
      ? req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      : req;

  return next(newReq);
};
