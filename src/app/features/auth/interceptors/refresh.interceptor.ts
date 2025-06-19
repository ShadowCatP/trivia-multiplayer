import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((err) => {
      // If the request was to /refresh and failed, logout
      if (req.url.includes('/refresh')) {
        auth.logout();
        return throwError(() => err);
      }

      // If 401, try to refresh
      if (err.status === 401) {
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

      // For other errors, just throw
      return throwError(() => err);
    }),
  );
};
