import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if (
        req.url.includes('/login') ||
        req.url.includes('/refresh') ||
        err.status !== 401
      ) {
        return throwError(() => err);
      }

      return authService.updateToken().pipe(
        switchMap((newToken) => {
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(retryReq);
        }),
        catchError((refreshErr) => {
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
