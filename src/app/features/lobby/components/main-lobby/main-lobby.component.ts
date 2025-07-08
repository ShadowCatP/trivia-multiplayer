import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Gamepad2, LucideAngularModule, Users, Zap } from 'lucide-angular';
import { LobbyService } from '../../services/lobby.service';
import { RoomsListComponent } from '../rooms-list/rooms-list.component';

@Component({
  selector: 'app-main-lobby',
  imports: [LucideAngularModule, ReactiveFormsModule, RoomsListComponent],
  templateUrl: './main-lobby.component.html',
  styleUrl: './main-lobby.component.css',
})
export class MainLobbyComponent {
  readonly Gamepad2 = Gamepad2;
  readonly Users = Users;
  readonly Zap = Zap;

  private readonly router = inject(Router);
  private readonly lobbyService = inject(LobbyService);

  roomCodeForm = new FormGroup({
    inviteCode: new FormControl('', Validators.required),
  });

  onJoin() {
    const inviteCode = this.roomCodeForm.get('inviteCode')?.value?.trim();

    if (!inviteCode) {
      return;
    }

    this.lobbyService.getRoomByInviteCode(inviteCode).subscribe({
      next: ({ id }) => {
        this.router.navigate(['/room', id]);
      },
      error: (err) => {
        if (err.status === 404) {
          this.roomCodeForm.setErrors({ apiError: 'Room not found' });
        } else {
          this.roomCodeForm.setErrors({
            apiError: 'An error occurred while joining the room',
          });
        }
      },
    });
  }

  hostGame() {
    this.router.navigate(['room', 'host']);
  }
}
