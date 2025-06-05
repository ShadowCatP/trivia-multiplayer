import { Component, inject, OnInit } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';
import { Room } from '../../types/Room';

@Component({
  selector: 'app-lobbies-list',
  imports: [],
  templateUrl: './lobbies-list.component.html',
  styleUrl: './lobbies-list.component.css',
})
export class LobbiesListComponent implements OnInit {
  private readonly lobbyService = inject(LobbyService);

  rooms: Room[] = [];

  ngOnInit(): void {
    // load initial server state
    this.lobbyService.getInitialRooms().subscribe({
      next: (initialRooms: any) => {
        this.rooms = initialRooms;
      },
      error: (err) => {
        console.error('Error loading initial rooms: ', err);
      },
    });

    // subsrabe to further updates from the server
    this.lobbyService.getRooms().subscribe({
      next: (res: any) => {
        console.log(res);
        this.rooms = res;
      },
      error: (err) => {
        console.error('Error loading rooms: ', err);
      },
    });
  }
}
