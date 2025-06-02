import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { LobbyComponent } from './features/lobby/components/lobby/lobby.component';
import { LogoutComponent } from './shared/components/logout/logout.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: LobbyComponent, canActivate: [authGuard] },
  { path: 'lobby/host', component: LogoutComponent, canActivate: [authGuard] },
];
