import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { InviteCodeComponent } from '../invite-code/invite-code.component';
import { UsersListComponent } from '../users-list/users-list.component';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from '../../services/lobby.service';
import { RoomService } from '../../services/room.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-lobby',
  imports: [LucideAngularModule, InviteCodeComponent, UsersListComponent],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css',
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  users: string[] = [];

  private readonly roomService = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly sub = new Subscription();

  private roomId = this.route.snapshot.paramMap.get('id');

  constructor() {}

  ngOnInit(): void {
    this.roomService.joinRoom(this.roomId!);

    const usersSub = this.roomService.getUsers().subscribe((users) => {
      this.users = users;
    });

    this.sub.add(usersSub);
  }

  ngOnDestroy(): void {
    this.roomService.leaveRoom(this.roomId!);
    this.sub.unsubscribe();
  }
}
