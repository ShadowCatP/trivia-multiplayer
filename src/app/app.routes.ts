import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { GameLobbyComponent } from './features/lobby/components/game-lobby/game-lobby.component';
import { HostRoomComponent } from './features/lobby/components/host-room/host-room.component';
import { MainLobbyComponent } from './features/lobby/components/main-lobby/main-lobby.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: MainLobbyComponent, canActivate: [authGuard] },
  { path: 'room/host', component: HostRoomComponent, canActivate: [authGuard] },
  { path: 'room/:id', component: GameLobbyComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];
