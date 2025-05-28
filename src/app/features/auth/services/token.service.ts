import { computed, effect, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly accessTokenKey =
    environment.accessTokenKey ?? 'access_token';
  private readonly refreshTokenKey =
    environment.refreshTokenKey ?? 'refresh_token';

  private readonly _access_token = signal<string | null>(
    localStorage.getItem(this.accessTokenKey),
  );

  private readonly _refresh_token = signal<string | null>(
    localStorage.getItem(this.refreshTokenKey),
  );

  readonly accessToken = computed(() => this._access_token());
  readonly refreshToken = computed(() => this._refresh_token());

  constructor() {
    effect(() => {
      const accessToken = this._access_token();
      const refreshToken = this._refresh_token();

      if (accessToken) localStorage.setItem(this.accessTokenKey, accessToken);
      else localStorage.removeItem(this.accessTokenKey);

      if (refreshToken)
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      else localStorage.removeItem(this.refreshTokenKey);
    });
  }

  setTokens(accessToken: string, refreshToken: string) {
    this._access_token.set(accessToken);
    this._refresh_token.set(refreshToken);
  }

  clearTokens() {
    this._access_token.set(null);
    this._refresh_token.set(null);
  }
}
