import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Play } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { RoomService } from '../../services/room.service';
import { RoomState } from '../../types/Room';
import { InviteCodeComponent } from '../invite-code/invite-code.component';
import { UsersListComponent } from '../users-list/users-list.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-game-lobby',
  imports: [LucideAngularModule, InviteCodeComponent, UsersListComponent],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css',
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  isHost = false;

  private readonly roomService = inject(RoomService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly sub = new Subscription();

  readonly Play = Play;

  roomState: RoomState = { users: [], host: null };

  private roomId = this.route.snapshot.paramMap.get('id');

  constructor() {}

  ngOnInit(): void {
    this.roomService.joinRoom(this.roomId!);

    const sub = this.roomService.roomState$.subscribe((state) => {
      this.roomState = state;

      const currentUser = this.authService.getCurrentUser();
      this.isHost = currentUser === state.host;
    });

    this.sub.add(sub);
  }

  ngOnDestroy(): void {
    this.roomService.leaveRoom(this.roomId!);
    this.sub.unsubscribe();
  }

  startGame() {
    console.log('Starting the game...');
  }
}
