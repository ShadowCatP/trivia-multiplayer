import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Gamepad2, Users, Zap } from 'lucide-angular';
import { RoomsListComponent } from '../rooms-list/rooms-list.component';
import { Router } from '@angular/router';
import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'app-lobby',
  imports: [LucideAngularModule, ReactiveFormsModule, RoomsListComponent],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.css',
})
export class LobbyComponent {
  readonly Gamepad2 = Gamepad2;
  readonly Users = Users;
  readonly Zap = Zap;
  private router = inject(Router);
  private lobbyService = inject(LobbyService);

  roomCodeForm = new FormGroup({
    roomId: new FormControl(''),
  });

  onJoin() {}

  hostGame() {
    this.lobbyService.createLobby().subscribe({
      next: () => {
        this.router.navigate(['room', 'host']);
      },
    });
  }
}
