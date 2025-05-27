import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const token = auth.token;
  const refreshToken = auth.refresh_token;

  const newReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(newReq).pipe(
    catchError((err) => {
      if (err.status === 401) {
        if (req.url.includes('/refresh')) {
          auth.logout();
          return throwError(() => err);
        }

        return auth.refreshToken().pipe(
          switchMap(() => {
            if (!refreshToken) return throwError(() => err);

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${refreshToken}` },
            });

            return next(retryReq);
          }),
          catchError((refreshErr) => {
            auth.logout();
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
