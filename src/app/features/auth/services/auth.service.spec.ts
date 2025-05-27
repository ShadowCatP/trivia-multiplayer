import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environments';

const TOKEN = 'header.payload.signature';

function createJwtSpy(expired: boolean) {
  return jasmine.createSpyObj('JwtHelperService', {
    isTokenExpired: expired,
  });
}

function buildTestBed(jwtSpy: any) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: Router,
        useValue: jasmine.createSpyObj('Router', ['navigate']),
      },
      { provide: JwtHelperService, useValue: jwtSpy },
      { provide: JWT_OPTIONS, useValue: {} },
    ],
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  afterEach(() => {
    http?.verify();
    localStorage.clear();
  });

  it('should set the token on successful login', () => {
    buildTestBed(createJwtSpy(false));
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    service.login({ username: 'john', password: 'doe' }).subscribe();
    const req = http.expectOne(environment.authUrl + '/login');
    req.flush({ access_token: TOKEN });

    TestBed.flushEffects();

    expect(service.token).toBe(TOKEN);
    expect(localStorage.getItem('access_token')).toBe(TOKEN);
  });

  it('should set the token on successful register', () => {
    buildTestBed(createJwtSpy(false));
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    service.register({ username: 'john', password: 'doe' }).subscribe();
    const req = http.expectOne(environment.authUrl + '/register');
    req.flush({ access_token: TOKEN });

    TestBed.flushEffects();

    expect(service.token).toBe(TOKEN);
    expect(localStorage.getItem('access_token')).toBe(TOKEN);
  });

  it('should return true on fresh token', () => {
    localStorage.setItem('access_token', TOKEN);
    buildTestBed(createJwtSpy(false));
    service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false on expired token', () => {
    localStorage.setItem('access_token', TOKEN);
    buildTestBed(createJwtSpy(true));
    service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should refresh token and update access token', () => {
    const REFRESH_TOKEN = 'refresh.header.signature';
    const NEW_ACCESS_TOKEN = 'access.header.signature';

    localStorage.setItem('refresh_token', REFRESH_TOKEN);

    buildTestBed(createJwtSpy(true));
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    service.refreshToken().subscribe();

    const req = http.expectOne(environment.authUrl + '/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${REFRESH_TOKEN}`,
    );

    req.flush({ access_token: NEW_ACCESS_TOKEN });

    TestBed.flushEffects();

    expect(service.token).toBe(NEW_ACCESS_TOKEN);
    expect(localStorage.getItem('access_token')).toBe(NEW_ACCESS_TOKEN);
  });

  it('should clear token on logout', () => {
    localStorage.setItem('access_token', TOKEN);
    buildTestBed(createJwtSpy(false));

    service = TestBed.inject(AuthService);

    service.logout();
    TestBed.flushEffects();

    expect(service.token).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
