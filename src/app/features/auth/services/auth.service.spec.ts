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
const REFRESH_TOKEN = 'refresh.header.signature';

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
      AuthService,
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
    req.flush({ access_token: TOKEN, refresh_token: REFRESH_TOKEN });

    TestBed.flushEffects();

    expect(service.accessToken).toBe(TOKEN);
    expect(localStorage.getItem('access_token')).toBe(TOKEN);
    expect(localStorage.getItem('refresh_token')).toBe(REFRESH_TOKEN);
  });

  it('should set the token on successful register', () => {
    buildTestBed(createJwtSpy(false));
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    service.register({ username: 'john', password: 'doe' }).subscribe();

    const req = http.expectOne(environment.authUrl + '/register');
    req.flush({ access_token: TOKEN, refresh_token: REFRESH_TOKEN });

    TestBed.flushEffects();

    expect(service.accessToken).toBe(TOKEN);
    expect(localStorage.getItem('access_token')).toBe(TOKEN);
    expect(localStorage.getItem('refresh_token')).toBe(REFRESH_TOKEN);
  });

  it('should return true on fresh token', () => {
    localStorage.setItem('access_token', TOKEN);
    localStorage.setItem('refresh_token', REFRESH_TOKEN);

    buildTestBed(createJwtSpy(false));
    service = TestBed.inject(AuthService);

    // isAuthenticated is a computed signal so call as function
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false on expired token', () => {
    localStorage.setItem('access_token', TOKEN);
    localStorage.setItem('refresh_token', REFRESH_TOKEN);

    buildTestBed(createJwtSpy(true));
    service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should refresh token and update access token', () => {
    localStorage.setItem('refresh_token', REFRESH_TOKEN);

    buildTestBed(createJwtSpy(true));
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    const NEW_ACCESS_TOKEN = 'new.access.token';

    service.updateToken().subscribe();

    const req = http.expectOne(environment.authUrl + '/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${REFRESH_TOKEN}`,
    );

    req.flush({ access_token: NEW_ACCESS_TOKEN });

    TestBed.flushEffects();

    expect(service.accessToken).toBe(NEW_ACCESS_TOKEN);
    expect(localStorage.getItem('access_token')).toBe(NEW_ACCESS_TOKEN);
  });

  it('should clear tokens on logout', () => {
    localStorage.setItem('access_token', TOKEN);
    localStorage.setItem('refresh_token', REFRESH_TOKEN);

    buildTestBed(createJwtSpy(false));
    service = TestBed.inject(AuthService);

    service.logout();

    TestBed.flushEffects();

    expect(service.accessToken).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});
