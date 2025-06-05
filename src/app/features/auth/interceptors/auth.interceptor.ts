import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const tokenService = inject(TokenService);

  const token = tokenService.accessToken();

  const newReq =
    token && !req.url.includes('/refresh')
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

        return auth.updateToken().pipe(
          switchMap(() => {
            const newToken = tokenService.accessToken();
            if (!newToken) {
              auth.logout();
              return throwError(() => err);
            }

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
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
