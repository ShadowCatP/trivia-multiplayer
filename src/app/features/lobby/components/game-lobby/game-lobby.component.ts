import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { InviteCodeComponent } from '../invite-code/invite-code.component';
import { UsersListComponent } from '../users-list/users-list.component';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'app-game-lobby',
  imports: [LucideAngularModule, InviteCodeComponent, UsersListComponent],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css',
})
export class GameLobbyComponent implements OnInit {
  users: string[] = [];

  private readonly lobbyService = inject(LobbyService);
  private readonly route = inject(ActivatedRoute);

  constructor() {}

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    this.lobbyService.joinRoom(roomId!);
    this.lobbyService.onPlayerJoined().subscribe((data) => {
      this.users = data;
    });
  }
}
