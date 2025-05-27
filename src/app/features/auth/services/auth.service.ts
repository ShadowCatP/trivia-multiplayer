import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = environment.authUrl;
  private readonly tokenKey = environment.tokenKey ?? 'access_token';

  private readonly _token = signal<string | null>(
    localStorage.getItem(this.tokenKey),
  );

  private readonly _refresh_token = signal<string | null>(
    localStorage.getItem('refresh_token'),
  );

  readonly isAuthenticated = computed(
    () =>
      !!this._token() &&
      (!this.jwtHelper.isTokenExpired(this._token()) ||
        !this.jwtHelper.isTokenExpired(this._refresh_token())),
  );

  get token(): string | null {
    return this._token() ?? null;
  }

  get refresh_token(): string | null {
    return this._refresh_token() ?? null;
  }

  private http = inject(HttpClient);
  private jwtHelper = inject(JwtHelperService);

  constructor() {
    effect(() => {
      const token = this._token();
      const refreshToken = this._refresh_token();
      if (token) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem('refresh_token', refreshToken!);
      } else {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('refresh_token');
      }
    }); // this will sync token in local storage
  }

  login(credentials: { username: string; password: string }) {
    return this.http
      .post<{
        access_token: string;
        refresh_token: string;
      }>(this.authUrl + '/login', credentials)
      .pipe(
        tap(({ access_token, refresh_token }) => {
          this._token.set(access_token);
          this._refresh_token.set(refresh_token);
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
          this._token.set(access_token);
          this._refresh_token.set(refresh_token);
        }),
        catchError((err) => {
          console.error('Registration Failed', err);
          return throwError(() => err);
        }),
      );
  }

  refreshToken() {
    console.log('access', this._token());
    console.log('refresh', this._refresh_token());
    if (!this._refresh_token())
      return throwError(() => new Error('No refresh token'));

    return this.http
      .post<{ access_token: string }>(this.authUrl + '/refresh', null, {
        headers: {
          Authorization: `Bearer ${this._refresh_token()}`,
        },
      })
      .pipe(
        tap(({ access_token }) => {
          this._token.set(access_token);
        }),
        catchError((err) => {
          console.error('Token refresh failed:', err);
          this.logout();
          return throwError(() => err);
        }),
      );
  }

  logout() {
    this._token.set(null);
    this._refresh_token.set(null);
  }
}
