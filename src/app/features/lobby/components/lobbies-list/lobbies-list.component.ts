import { Component, inject } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';
import { Room } from '../../types/Room';

@Component({
  selector: 'app-lobbies-list',
  imports: [],
  templateUrl: './lobbies-list.component.html',
  styleUrl: './lobbies-list.component.css',
})
export class LobbiesListComponent {
  private readonly lobbyService = inject(LobbyService);

  rooms: Room[] = [];

  constructor() {
    this.lobbyService.getRooms().subscribe({
      next: (res: any) => {
        this.rooms = res;
        console.log(res);
      },
      error: (err) => {
        console.log('Error loading rooms: ', err);
      },
    });
  }
}
