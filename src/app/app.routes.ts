import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { LogoutComponent } from './shared/components/logout/logout.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: LogoutComponent, canActivate: [authGuard] },
];
