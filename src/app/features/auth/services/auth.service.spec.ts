import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

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
    const req = http.expectOne('/api/login');
    req.flush({ token: TOKEN });

    TestBed.flushEffects();

    expect(service.getToken()).toBe(TOKEN);
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

  it('should clear token on logout', () => {
    localStorage.setItem('access_token', TOKEN);
    buildTestBed(createJwtSpy(false));

    service = TestBed.inject(AuthService);

    service.logout();
    TestBed.flushEffects();

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
