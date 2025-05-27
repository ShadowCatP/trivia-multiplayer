import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { AppComponent } from './app.component';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: AppComponent, canActivate: [authGuard] },
];
