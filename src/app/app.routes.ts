import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { HostRoomComponent } from './features/lobby/components/host-room/host-room.component';
import { LobbyComponent } from './features/lobby/components/lobby/lobby.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: LobbyComponent, canActivate: [authGuard] },
  { path: 'room/host', component: HostRoomComponent, canActivate: [authGuard] },
];
