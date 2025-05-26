import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = environment.authUrl; // TODO add real backend endpoint here
  private readonly tokenKey = environment.tokenKey ?? 'access_token';

  private readonly _token = signal<string | null>(
    localStorage.getItem(this.tokenKey),
  );

  readonly isAuthenticated = computed(
    () => !!this._token() && !this.jwtHelper.isTokenExpired(this._token()),
  );

  get token(): string | null {
    return this._token() ?? null;
  }

  private http = inject(HttpClient);
  private jwtHelper = inject(JwtHelperService);

  constructor() {
    effect(() => {
      const token = this._token();
      if (token) {
        localStorage.setItem(this.tokenKey, token);
      } else {
        localStorage.removeItem(this.tokenKey);
      }
    }); // this will sync token in local storage
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post<{ token: string }>(this.authUrl, credentials).pipe(
      tap(({ token }) => this._token.set(token)),
      catchError((err) => {
        console.error('Login Failed', err);
        return throwError(() => err);
      }),
    ); // subcribing must be handled by user
  }

  logout() {
    this._token.set(null);
  }
}
