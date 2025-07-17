import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environments';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = environment.authUrl;

  private readonly http = inject(HttpClient);
  private readonly jwtHelper = inject(JwtHelperService);
  private readonly tokenService = inject(TokenService);

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  get accessToken(): string | null {
    return this.tokenService.accessToken();
  }

  get refreshToken(): string | null {
    return this.tokenService.refreshToken();
  }

  readonly isAuthenticated = computed(() => {
    const accessToken = this.tokenService.accessToken();
    const refreshToken = this.tokenService.refreshToken();
    return (
      !!accessToken &&
      (!this.jwtHelper.isTokenExpired(accessToken) ||
        !this.jwtHelper.isTokenExpired(refreshToken))
    );
  });

  checkAuthAndRefresh(): Observable<boolean> {
    const accessToken = this.tokenService.accessToken();
    const refreshToken = this.tokenService.refreshToken();

    if (!this.isValidJwt(accessToken) || !this.isValidJwt(refreshToken)) {
      this.logout();
      return of(false);
    }

    if (!this.jwtHelper.isTokenExpired(accessToken)) {
      return of(true);
    }

    if (this.jwtHelper.isTokenExpired(refreshToken)) {
      this.logout();
      return of(false);
    }

    return this.updateToken().pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      }),
    );
  }

  login(credentials: { username: string; password: string }) {
    return this.http
      .post<{
        access_token: string;
        refresh_token: string;
      }>(this.authUrl + '/login', credentials)
      .pipe(
        tap(({ access_token, refresh_token }) => {
          this.tokenService.setTokens(access_token, refresh_token);
        }),
        catchError((err) => {
          console.error('Login Failed', err);
          return throwError(() => err);
        }),
      ); // subcribing must be handled by user
  }

  register(credentials: { username: string; password: string }) {
    return this.http
      .post<{
        access_token: string;
        refresh_token: string;
      }>(this.authUrl + '/register', credentials)
      .pipe(
        tap(({ access_token, refresh_token }) => {
          this.tokenService.setTokens(access_token, refresh_token);
        }),
        catchError((err) => {
          console.error('Registration Failed', err);
          return throwError(() => err);
        }),
      );
  }

  updateToken(): Observable<string> {
    if (this.isRefreshing) {
      return new Observable((observer) => {
        this.refreshTokenSubject.subscribe((token) => {
          if (token) {
            observer.next(token);
            observer.complete();
          }
        });
      });
    } else {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenService.refreshToken();
      if (!refreshToken) {
        this.isRefreshing = false;
        this.logout();
        return throwError(() => new Error('No refresh token'));
      }

      return this.http
        .post<{ access_token: string }>(`${this.authUrl}/refresh`, null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        })
        .pipe(
          tap(({ access_token }) => {
            this.isRefreshing = false;
            this.tokenService.setTokens(access_token, refreshToken!);
            this.refreshTokenSubject.next(access_token);
          }),
          switchMap(({ access_token }) => {
            return new Observable<string>((observer) =>
              observer.next(access_token),
            );
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.logout();
            return throwError(() => err);
          }),
        );
    }
  }

  logout() {
    this.tokenService.clearTokens();
  }

  getCurrentUser(): string | null {
    const accessToken = this.tokenService.accessToken();

    if (!accessToken) {
      return null;
    }

    try {
      const decodedToken = this.jwtHelper.decodeToken(accessToken);
      return decodedToken?.sub || null;
    } catch (err) {
      return null;
    }
  }

  private isValidJwt(token: string | null): boolean {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    try {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      if (!payload || typeof payload !== 'object') return false;
      return true;
    } catch (e) {
      return false;
    }
  }
}
